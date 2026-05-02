# 🦖 watermark

Un módulo ligero y potente en JavaScript puro para agregar marcas de agua a imágenes y videos. Construido con `canvas` y `fluent-ffmpeg`, maneja sin problemas archivos locales, buffers y URLs, y sube automáticamente el contenido multimedia procesado a una CDN dual (Adoolab y Soymaycol).

---

<details>
<summary>🇪🇸 Ver en Español</summary>
  
## 🌾 Español

### 🍄 Características

- 🦖 **Soporte Multiformato:** Agrega marcas de agua tanto a imágenes como a videos.
- 🐢 **Marcas de Agua Animadas:** Soporta GIFs y videos cortos (hasta 15 segundos) como marca de agua sobre otros videos.
- 📍 **Entradas Flexibles:** Acepta rutas de archivos locales, Buffers o URLs directas HTTP/HTTPS.
- 🌾 **Posicionamiento Personalizado:** Coloca tu marca de agua exactamente donde la necesitas usando coordenadas o posiciones relativas (`left`, `center`, `right`, `top`, `bottom`).
- 🍄 **Opacidad y Escalado:** Ajusta la transparencia de la marca de agua y escala su ancho automáticamente manteniendo la proporción original.
- 🦖 **Auto-CDN Dual:** Sube automáticamente el resultado a dos CDNs al mismo tiempo y devuelve ambos enlaces listos para usarse en tu bot o aplicación.

### 📍 Instalación

Para instalar el módulo directamente desde GitHub usando la terminal (CLI), ejecuta:

# VIA GITHUB
```bash
npm install github:thisAdo/watermark
```

# VIA NPM
```bash
npm install @adomay/watermark
```

Como este módulo utiliza la sintaxis moderna de módulos de ECMAScript (`import`/`export`), debes asegurarte de que el proyecto donde lo vayas a usar tenga configurado `"type": "module"` en su archivo `package.json`. Tu `package.json` debería verse similar a esto:

```json
{
  "name": "mi-proyecto-increible",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "watermark": "github:thisAdo/watermark" // Via Github
    "@adomay/watermark": "*" // Via NPM
  }
}
```

### 🌾 Ejemplos de Uso

A continuación se muestran ejemplos de cómo utilizar el módulo en diferentes escenarios. En todos los casos, el módulo procesará los archivos y devolverá los enlaces finales.

#### 🍄 1. Marca de agua en una Imagen

```javascript
import { Watermark } from 'watermark';

async function aplicarMarcaDeAgua() {
    const watermarkService = new Watermark();

    const options = {
        x: 'right',
        y: 'bottom',
        margin: 20,
        opacity: 0.8,
        width: 150
    };

    const result = await watermarkService.execute(
        'https://cdn.adoolab.xyz/dl/8932d34a.jpg',
        'https://cdn.adoolab.xyz/dl/watermark.png',
        'image',
        options
    );

    if (result.status) {
        console.log(result.urls.ado);
        console.log(result.urls.maycol);
    }
}

aplicarMarcaDeAgua();
```

#### 🐢 2. Marca de agua (Imagen) en un Video

```javascript
import { Watermark } from 'watermark';

async function aplicarMarcaDeAguaVideo() {
    const watermarkService = new Watermark();

    const options = {
        x: 'left',
        y: 'top',
        margin: 15,
        opacity: 0.9,
        width: 120
    };

    const result = await watermarkService.execute(
        'https://cdn.adoolab.xyz/dl/db6f3f3b.mp4',
        'https://cdn.adoolab.xyz/dl/watermark.png',
        'video',
        options
    );

    if (result.status) {
        console.log(result.urls.ado);
        console.log(result.urls.maycol);
    }
}

aplicarMarcaDeAguaVideo();
```

#### 🦖 3. Marca de agua Animada (GIF/Video) en un Video

```javascript
import { Watermark } from 'watermark';

async function aplicarMarcaDeAguaAnimada() {
    const watermarkService = new Watermark();

    const options = {
        x: 'left',
        y: 'bottom',
        margin: 20,
        opacity: 0.8,
        width: 100
    };

    const result = await watermarkService.execute(
        'https://cdn.adoolab.xyz/dl/db6f3f3b.mp4',
        'https://cdn.adoolab.xyz/dl/e426a597.gif',
        'video',
        options
    );

    if (result.status) {
        console.log(result.urls.ado);
        console.log(result.urls.maycol);
    }
}

aplicarMarcaDeAguaAnimada();
```

### 📍 Referencia de la API

#### `execute(source, watermark, type, options)`

Inicia el proceso de superposición de la marca de agua y devuelve un objeto que contiene el Buffer resultante y los enlaces de las subidas a las CDN.

**🌾 Parámetros:**

| Parámetro   | Tipo               | Descripción |
|-------------|--------------------|-------------|
| `source`    | `String \| Buffer` | El archivo principal. Puede ser una ruta local, una URL HTTP/HTTPS directa o un Buffer en memoria. |
| `watermark` | `String \| Buffer` | El archivo de la marca de agua. En videos, si es animada, se recortará automáticamente a un máximo de 15 segundos. |
| `type`      | `String`           | El tipo de medio del archivo principal. Debe ser `'image'` o `'video'`. Por defecto: `'image'`. |
| `options`   | `Object`           | Objeto opcional de configuración para cambiar la apariencia y posición de la marca de agua. |

**🍄 Objeto `options`:**

| Propiedad | Tipo               | Por defecto | Descripción |
|-----------|--------------------|-------------|-------------|
| `x`       | `String \| Number` | `'right'`   | Posición horizontal. Acepta `'left'`, `'center'`, `'right'`, o un número exacto en píxeles. |
| `y`       | `String \| Number` | `'bottom'`  | Posición vertical. Acepta `'top'`, `'center'`, `'bottom'`, o un número exacto en píxeles. |
| `margin`  | `Number`           | `20`        | Distancia en píxeles hacia los bordes (se aplica cuando usas posiciones relativas como `'right'` o `'bottom'`). |
| `width`   | `Number`           | `null`      | Fuerza a la marca de agua a cambiar su tamaño a este ancho específico en píxeles. La altura se ajusta automáticamente. |
| `opacity` | `Number`           | `1.0`       | Nivel de transparencia de la marca de agua. Va desde `0.0` (invisible) hasta `1.0` (totalmente opaco). |

**🐢 Valor de Retorno:**

Si el proceso tiene éxito, devuelve un objeto con la siguiente estructura:

```javascript
{
  creator: 'Ado & Maycol',
  status: true,
  data: <Buffer>,
  urls: {
    ado: 'https://cdn.adoolab.xyz/dl/output.png',
    maycol: 'https://cdn.soymaycol.icu/files/output.png'
  },
  cdnData: {
    ado: { ... },
    maycol: { ... }
  }
}
```

En caso de error, devuelve:

```javascript
{
  creator: 'Ado & Maycol',
  status: false,
  msg: 'Descripción detallada del error'
}
```
</details>

---

<details>
<summary>🇺🇸 View in English</summary></summary>
  
## 🌾 English

### 🍄 Features

- 🦖 **Multi-Format Support:** Add watermarks to both images and videos.
- 🐢 **Animated Watermarks:** Supports GIFs and short videos (up to 15 seconds) as watermarks over other videos.
- 📍 **Flexible Inputs:** Accepts local file paths, raw Buffers, or direct HTTP/HTTPS URLs.
- 🌾 **Custom Positioning:** Place your watermark exactly where you need it using custom coordinates or relative text positions (`left`, `center`, `right`, `top`, `bottom`).
- 🍄 **Opacity & Scaling:** Adjust watermark transparency and auto-scale width while keeping the original aspect ratio.
- 🦖 **Dual Auto-CDN:** Automatically uploads the resulting output to two external CDNs simultaneously and returns both ready-to-use URLs.


### 📍 Installation

To install the module directly from the GitHub using the CLI, run the following command:

# BY GITHUB
```bash
npm install github:thisAdo/watermark
```

# BY NPM
```bash
npm install @adomay/watermark
```

Since this module uses modern ECMAScript module syntax (`import`/`export`), you must ensure that the project where you are using it has `"type": "module"` set in its `package.json`. Your `package.json` should look similar to this:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "watermark": "github:thisAdo/watermark" // by Github
    "@adomay/watermark": "*" // by NPM
  }
}
```

### 🌾 Usage Examples

Below are examples of how to use the module in different scenarios. In all cases, the module will process the files and return the final URLs.

#### 🍄 1. Watermark on an Image

```javascript
import { Watermark } from 'watermark';

async function applyImageWatermark() {
    const watermarkService = new Watermark();

    const options = {
        x: 'right',
        y: 'bottom',
        margin: 20,
        opacity: 0.8,
        width: 150
    };

    const result = await watermarkService.execute(
        'https://cdn.adoolab.xyz/dl/8932d34a.jpg',
        'https://cdn.adoolab.xyz/dl/watermark.png',
        'image',
        options
    );

    if (result.status) {
        console.log(result.urls.ado);
        console.log(result.urls.maycol);
    }
}

applyImageWatermark();
```

#### 🐢 2. Static Watermark (Image) on a Video

```javascript
import { Watermark } from 'watermark';

async function applyVideoWatermark() {
    const watermarkService = new Watermark();

    const options = {
        x: 'left',
        y: 'top',
        margin: 15,
        opacity: 0.9,
        width: 120
    };

    const result = await watermarkService.execute(
        'https://cdn.adoolab.xyz/dl/db6f3f3b.mp4',
        'https://cdn.adoolab.xyz/dl/watermark.png',
        'video',
        options
    );

    if (result.status) {
        console.log(result.urls.ado);
        console.log(result.urls.maycol);
    }
}

applyVideoWatermark();
```

#### 🦖 3. Animated Watermark (GIF/Video) on a Video

```javascript
import { Watermark } from 'watermark';

async function applyAnimatedWatermark() {
    const watermarkService = new Watermark();

    const options = {
        x: 'left',
        y: 'bottom',
        margin: 20,
        opacity: 0.8,
        width: 100
    };

    const result = await watermarkService.execute(
        'https://cdn.adoolab.xyz/dl/db6f3f3b.mp4',
        'https://cdn.adoolab.xyz/dl/e426a597.gif',
        'video',
        options
    );

    if (result.status) {
        console.log(result.urls.ado);
        console.log(result.urls.maycol);
    }
}

applyAnimatedWatermark();
```

### 📍 API Reference

#### `execute(source, watermark, type, options)`

Executes the watermark overlay process and returns an object containing the resulting Buffer and the dual CDN upload data.

**🌾 Parameters:**

| Parameter   | Type               | Description |
|-------------|--------------------|-------------|
| `source`    | `String \| Buffer` | The main media file. Can be a local path, an HTTP/HTTPS URL, or a Buffer. |
| `watermark` | `String \| Buffer` | The watermark file. In videos, if this is an animated watermark, it is automatically trimmed to a maximum of 15 seconds. |
| `type`      | `String`           | Specifies the main media type. Must be either `'image'` or `'video'`. Defaults to `'image'`. |
| `options`   | `Object`           | Optional configuration object to change the watermark's appearance and position. |

**🍄 Options Object:**

| Property  | Type               | Default    | Description |
|-----------|--------------------|------------|-------------|
| `x`       | `String \| Number` | `'right'`  | Horizontal position. Accepts `'left'`, `'center'`, `'right'`, or a specific number in pixels. |
| `y`       | `String \| Number` | `'bottom'` | Vertical position. Accepts `'top'`, `'center'`, `'bottom'`, or a specific number in pixels. |
| `margin`  | `Number`           | `20`       | Margin in pixels applied when using relative string positions. |
| `width`   | `Number`           | `null`     | Forces the watermark to scale to a specific width in pixels, keeping the original aspect ratio. |
| `opacity` | `Number`           | `1.0`      | Transparency level of the watermark, from `0.0` (invisible) to `1.0` (fully opaque). |

**🐢 Return Value:**

If successful, returns a Promise that resolves to an object with the following structure:

```javascript
{
  creator: 'Ado & Maycol',
  status: true,
  data: <Buffer>,
  urls: {
    ado: 'https://cdn.adoolab.xyz/dl/output.png',
    maycol: 'https://cdn.soymaycol.icu/files/output.png'
  },
  cdnData: {
    ado: { ... },
    maycol: { ... }
  }
}
```

If an error occurs, it returns:

```javascript
{
  creator: 'Ado & Maycol',
  status: false,
  msg: 'Detailed error description'
}
```
</details>

---
