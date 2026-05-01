import { promises as fs } from 'fs';

export async function processVideo(ffmpeg, sourcePath, watermarkPath, options) {
	const videoData = await fs.readFile(sourcePath);
	const watermarkData = await fs.readFile(watermarkPath);

	await ffmpeg.writeFile('input.mp4', videoData);
	await ffmpeg.writeFile('watermark.png', watermarkData);

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

	await ffmpeg.exec([
		'-i', 'input.mp4',
		'-i', 'watermark.png',
		'-filter_complex', filters.join(';'),
		'-c:a', 'copy',
		'output.mp4'
	]);

	const outputData = await ffmpeg.readFile('output.mp4');

	await ffmpeg.deleteFile('input.mp4');
	await ffmpeg.deleteFile('watermark.png');
	await ffmpeg.deleteFile('output.mp4');

	return Buffer.from(outputData);
}
