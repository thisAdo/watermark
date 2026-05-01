import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export const isUrl = (str) => typeof str === 'string' && /^https?:\/\//.test(str);

export async function getBuffer(input) {
	if (Buffer.isBuffer(input)) return input;
	
	if (isUrl(input)) {
		const res = await fetch(input);
		if (!res.ok) throw new Error(`Error al descargar la URL: ${input}`);
		const arrayBuffer = await res.arrayBuffer();
		return Buffer.from(arrayBuffer);
	}
	
	return await fs.readFile(input);
}

export async function getTempFilePath(input, prefix = 'tmp') {
	if (typeof input === 'string' && !isUrl(input)) {
		return { path: input, isTemp: false };
	}

	const buffer = await getBuffer(input);
	const tempPath = path.join(os.tmpdir(), `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`);
	await fs.writeFile(tempPath, buffer);
	
	return { path: tempPath, isTemp: true };
}
