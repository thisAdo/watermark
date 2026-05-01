import { processImage } from './lib/image.js';
import { processVideo } from './lib/video.js';
import { uploadToCDN } from './lib/upload.js';

export class Watermark {
	#creators = 'Ado & Maycol';

	async execute(source, watermark, type = 'image', options = {}) {
		try {
			const config = {
				x: 'right',
				y: 'bottom',
				margin: 20,
				width: null,
				opacity: 1.0,
				uploadToCDN: false,
				...options
			};

			let buffer;
			let mimetype;
			let extension;

			if (type === 'image') {
				buffer = await processImage(source, watermark, config);
				mimetype = 'image/png';
				extension = 'png';
			} else if (type === 'video') {
				buffer = await processVideo(source, watermark, config);
				mimetype = 'video/mp4';
				extension = 'mp4';
			} else {
				throw new Error(`Invalid type "${type}". Valid types are "image" and "video".`);
			}

			let cdnResponse = null;
			if (config.uploadToCDN) {
				cdnResponse = await uploadToCDN(buffer, mimetype, extension);
			}

			return {
				creator: this.#creators,
				status: true,
				data: buffer,
				url: cdnResponse ? cdnResponse.url : null,
				cdnData: cdnResponse
			};
		} catch (e) {
			return {
				creator: this.#creators,
				status: false,
				msg: e instanceof Error ? e.message : String(e),
			};
		}
	}
}
