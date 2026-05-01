import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { getTempFilePath } from './utils.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function processVideo(source, watermark, options) {
	const sourceFile = await getTempFilePath(source, 'video');
	const watermarkFile = await getTempFilePath(watermark, 'wm');

	return new Promise((resolve, reject) => {
		const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.mp4`);

		let overlayX = options.margin.toString();
		if (options.x === 'right') overlayX = `W-w-${options.margin}`;
		else if (options.x === 'center') overlayX = '(W-w)/2';
		else if (typeof options.x === 'number') overlayX = options.x.toString();

		let overlayY = options.margin.toString();
		if (options.y === 'bottom') overlayY = `H-h-${options.margin}`;
		else if (options.y === 'center') overlayY = '(H-h)/2';
		else if (typeof options.y === 'number') overlayY = options.y.toString();

		let wmStream = '[1:v]';
		let filters = [];

		if (options.width || options.opacity < 1.0) {
			let wmFilters = [];
			if (options.width) wmFilters.push(`scale=${options.width}:-1`);
			if (options.opacity < 1.0) wmFilters.push(`format=rgba,colorchannelmixer=aa=${options.opacity}`);
			
			filters.push(`${wmStream}${wmFilters.join(',')}[wm]`);
			wmStream = '[wm]';
		}

		filters.push(`[0:v]${wmStream}overlay=${overlayX}:${overlayY}`);

		const cleanup = async () => {
			if (sourceFile.isTemp) await fs.unlink(sourceFile.path).catch(() => {});
			if (watermarkFile.isTemp) await fs.unlink(watermarkFile.path).catch(() => {});
			await fs.unlink(tempOutput).catch(() => {});
		};

		ffmpeg(sourceFile.path)
			.input(watermarkFile.path)
			.complexFilter(filters)
			.outputOptions(['-c:a copy'])
			.save(tempOutput)
			.on('end', async () => {
				try {
					const buffer = await fs.readFile(tempOutput);
					await cleanup();
					resolve(buffer);
				} catch (err) {
					await cleanup();
					reject(err);
				}
			})
			.on('error', async (err) => {
				await cleanup();
				reject(new Error(`FFmpeg error: ${err.message}`));
			});
	});
}
