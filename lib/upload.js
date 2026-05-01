export async function uploadToCDN(buffer, mimetype, extension) {
	try {
		const base64 = buffer.toString('base64');
		const response = await fetch('https://cdn.adoolab.xyz/api/upload', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				filename: `output.${extension}`,
				data: base64,
				mimetype: mimetype,
				expiration: '24h'
			})
		});

		if (!response.ok) throw new Error('CDN Upload failed');
		return await response.json();
	} catch (e) {
		throw e;
	}
}
