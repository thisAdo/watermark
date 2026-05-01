# @watermark

A lightweight and powerful pure JavaScript module for adding watermarks to images and videos. Built with `canvas` and `fluent-ffmpeg`, it seamlessly handles local files, buffers, and URLs, and automatically uploads the processed media to a CDN.

## Features

* **Multi-Format Support:** Add watermarks to both images and videos.
* **Flexible Inputs:** Accepts local file paths, raw Buffers, or direct HTTP/HTTPS URLs.
* **Custom Positioning:** Place your watermark exactly where you need it (custom coordinates, center, right, bottom).
* **Opacity & Scaling:** Adjust watermark transparency and auto-scale width.
* **Auto-CDN:** Automatically uploads the resulting output to an external CDN and returns a ready-to-use URL.
* **Zero System Dependencies:** Includes `@ffmpeg-installer/ffmpeg` to run seamlessly without requiring manual FFmpeg installations on the host machine.

## Installation

```bash
npm install @watermark

```
## Usage
You can import the module and process your media with a single asynchronous method.
### Processing an Image
```javascript
import { Watermark } from '@watermark';

const watermarkService = new Watermark();

const options = {
  x: 'right',
  y: 'bottom',
  margin: 20,
  opacity: 0.8,
  width: 150
};

const result = await watermarkService.execute(
  '[https://example.com/source-image.jpg](https://example.com/source-image.jpg)',
  './local-logo.png',
  'image',
  options
);

console.log(result);

```
### Processing a Video
```javascript
import { Watermark } from '@watermark';

const watermarkService = new Watermark();

const result = await watermarkService.execute(
  './input-video.mp4',
  '[https://example.com/watermark.png](https://example.com/watermark.png)',
  'video',
  {
    x: 'center',
    y: 'center',
    opacity: 0.5
  }
);

console.log(result.url);

```
## API Reference
### execute(source, watermark, type, options)
Executes the watermark overlay process and returns an object containing the buffer and the CDN upload data.
#### Parameters
 * source *(String | Buffer)*: The main image or video. Can be a local path, an HTTP/HTTPS URL, or a Buffer.
 * watermark *(String | Buffer)*: The watermark image. Can be a local path, an HTTP/HTTPS URL, or a Buffer.
 * type *(String)*: Specifies the media type. Must be either 'image' or 'video'. Defaults to 'image'.
 * options *(Object)*: Configuration object for the watermark appearance.
#### Options Object
| Property | Type | Default | Description |
|---|---|---|---|
| x | String | Number | 'right' | Horizontal position. Accepts 'right', 'center', or a specific number in pixels. |
| y | String | Number | 'bottom' | Vertical position. Accepts 'bottom', 'center', or a specific number in pixels. |
| margin | Number | 20 | Margin in pixels applied when using string positions ('right', 'bottom'). |
| width | Number | null | null | Forces the watermark to scale to a specific width in pixels, keeping aspect ratio. |
| opacity | Number | 1.0 | Transparency level of the watermark, from 0.0 (invisible) to 1.0 (opaque). |
#### Return Value
Returns a Promise that resolves to an object with the following structure:
```javascript
{
  creator: 'Ado & Maycol',
  status: true,
  data: <Buffer>,
  url: '[https://cdn.adoolab.xyz/](https://cdn.adoolab.xyz/)...',
  cdnData: { ... }
}

```
If an error occurs, it returns:
```javascript
{
  creator: 'Ado & Maycol',
  status: false,
  msg: 'Error description'
}

```
## License
MIT
