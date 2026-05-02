import { createCanvas, loadImage } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { getBuffer, getTempFilePath, formatTimestamp } from './utils.js';
import { generateTextBuffer } from './text.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function drawSingleWatermark(ctx, watermarkImg, options) {
    const wmWidth = options.width || watermarkImg.width;
    const wmHeight = (watermarkImg.height / watermarkImg.width) * wmWidth;

    if (options.x === 'tile' || options.y === 'tile') {
        ctx.globalAlpha = options.opacity;
        for (let y = 0; y < ctx.canvas.height; y += wmHeight + (options.margin || 20)) {
            for (let x = 0; x < ctx.canvas.width; x += wmWidth + (options.margin || 20)) {
                ctx.save();
                if (options.rotation) {
                    ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
                    ctx.rotate((options.rotation * Math.PI) / 180);
                    ctx.drawImage(watermarkImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
                } else {
                    ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
                }
                ctx.restore();
            }
        }
        ctx.globalAlpha = 1.0;
        return;
    }

    let x = options.margin || 0;
    let y = options.margin || 0;

    if (options.x === 'right') x = ctx.canvas.width - wmWidth - (options.margin || 0);
    else if (options.x === 'center') x = (ctx.canvas.width - wmWidth) / 2;
    else if (typeof options.x === 'number') x = options.x;

    if (options.y === 'bottom') y = ctx.canvas.height - wmHeight - (options.margin || 0);
    else if (options.y === 'center') y = (ctx.canvas.height - wmHeight) / 2;
    else if (typeof options.y === 'number') y = options.y;

    ctx.globalAlpha = options.opacity;
    ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
    ctx.globalAlpha = 1.0;
}

export async function processImage(source, watermark, options) {
    const sourceBuffer = await getBuffer(source);
    const sourceImg = await loadImage(sourceBuffer);

    const outputFormat = options.outputFormat || 'png';
    const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const quality = options.quality || 90;

    const canvas = createCanvas(sourceImg.width, sourceImg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

    let watermarksToProcess = [];

    if (options.timestamp) {
        options.text = formatTimestamp(options.timestampFormat);
    }

    if (options.text) {
        const textBuffer = await generateTextBuffer(options);
        const textImg = await loadImage(textBuffer);
        watermarksToProcess.push({ img: textImg, opts: options });
    } else if (Array.isArray(watermark)) {
        for (const wm of watermark) {
            const wmBuffer = await getBuffer(wm.source);
            const wmImg = await loadImage(wmBuffer);
            watermarksToProcess.push({ img: wmImg, opts: { ...options, ...wm } });
        }
    } else if (watermark) {
        const watermarkBuffer = await getBuffer(watermark);
        const watermarkImg = await loadImage(watermarkBuffer);
        watermarksToProcess.push({ img: watermarkImg, opts: options });
    }

    for (const item of watermarksToProcess) {
        await drawSingleWatermark(ctx, item.img, item.opts);
    }

    return canvas.toBuffer(mimeType, { quality });
}

export async function processImageRemoval(source, region) {
    const sourceFile = await getTempFilePath(source, 'img_rm');
    const tempOutput = path.join(os.tmpdir(), `removed_img_${Date.now()}.png`);

    const getDimensions = (filePath) => new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            const videoStream = metadata.streams.find(s => s.width);
            if (videoStream) resolve({ width: videoStream.width, height: videoStream.height });
            else reject(new Error('No se encontró resolución en la imagen'));
        });
    });

    return new Promise((resolve, reject) => {
        getDimensions(sourceFile.path).then(dimensions => {
            let w = region.width || 100;
            let h = region.height || 100;
            const margin = region.margin || 0;

            let posX = margin;
            if (region.x === 'right') posX = dimensions.width - w - margin;
            else if (region.x === 'center') posX = Math.floor((dimensions.width - w) / 2);
            else if (typeof region.x === 'number') posX = region.x;

            let posY = margin;
            if (region.y === 'bottom') posY = dimensions.height - h - margin;
            else if (region.y === 'center') posY = Math.floor((dimensions.height - h) / 2);
            else if (typeof region.y === 'number') posY = region.y;

            posX = Math.max(0, posX);
            posY = Math.max(0, posY);
            if (posX + w > dimensions.width) w = dimensions.width - posX;
            if (posY + h > dimensions.height) h = dimensions.height - posY;

            if (w <= 0 || h <= 0) {
                return reject(new Error('La región a borrar sale de los límites de la imagen.'));
            }

            const filterComplex = `delogo=x=${posX}:y=${posY}:w=${w}:h=${h}`;

            ffmpeg(sourceFile.path)
                .complexFilter(filterComplex)
                .outputOptions(['-frames:v', '1'])
                .save(tempOutput)
                .on('end', async () => {
                    try {
                        const buffer = await fs.readFile(tempOutput);
                        await fs.unlink(tempOutput).catch(() => {});
                        if (sourceFile.isTemp) await fs.unlink(sourceFile.path).catch(() => {});
                        resolve(buffer);
                    } catch (err) {
                        reject(err);
                    }
                })
                .on('error', async (err) => {
                    await fs.unlink(tempOutput).catch(() => {});
                    if (sourceFile.isTemp) await fs.unlink(sourceFile.path).catch(() => {});
                    reject(new Error(`FFmpeg error: ${err.message}`));
                });
        }).catch(err => {
            reject(new Error(`Error al leer dimensiones de la imagen: ${err.message}`));
        });
    });
}