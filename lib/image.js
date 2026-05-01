import { createCanvas, loadImage } from 'canvas';

export async function processImage(sourcePath, watermarkPath, options) {
	const sourceImg = await loadImage(sourcePath);
	const watermarkImg = await loadImage(watermarkPath);

	const canvas = createCanvas(sourceImg.width, sourceImg.height);
	const ctx = canvas.getContext('2d');

	ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

	const wmWidth = options.width || watermarkImg.width;
	const wmHeight = (watermarkImg.height / watermarkImg.width) * wmWidth;

	let x = options.margin;
	let y = options.margin;

	if (options.x === 'right') x = canvas.width - wmWidth - options.margin;
	else if (options.x === 'center') x = (canvas.width - wmWidth) / 2;
	else if (typeof options.x === 'number') x = options.x;

	if (options.y === 'bottom') y = canvas.height - wmHeight - options.margin;
	else if (options.y === 'center') y = (canvas.height - wmHeight) / 2;
	else if (typeof options.y === 'number') y = options.y;

	ctx.globalAlpha = options.opacity;
	ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
	ctx.globalAlpha = 1.0;

	return canvas.toBuffer('image/png');
}
