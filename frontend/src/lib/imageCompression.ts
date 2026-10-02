const MAX_DIMENSION = 2400;
export const MAX_COMPRESSED_BYTES = 2 * 1024 * 1024;
const QUALITY_STEPS = [0.92, 0.88, 0.84, 0.8, 0.75, 0.7, 0.62, 0.55];
const MIN_SCALE = 0.5;
const PASSTHROUGH_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXIF_SCAN_BYTES = 128 * 1024;

async function hasExifRotation(file: File): Promise<boolean> {
  if (file.type !== 'image/jpeg') return false;
  const view = new DataView(await file.slice(0, EXIF_SCAN_BYTES).arrayBuffer());
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return false;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    const length = view.getUint16(offset + 2);
    if (marker === 0xffda || (marker & 0xff00) !== 0xff00) return false;
    if (
      marker === 0xffe1 &&
      offset + 10 <= view.byteLength &&
      view.getUint32(offset + 4) === 0x45786966
    ) {
      const tiff = offset + 10;
      if (tiff + 8 > view.byteLength) return false;
      const little = view.getUint16(tiff) === 0x4949;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      if (ifd + 2 > view.byteLength) return false;
      const entries = view.getUint16(ifd, little);
      for (let i = 0; i < entries; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > view.byteLength) return false;
        if (view.getUint16(entry, little) === 0x0112) {
          return view.getUint16(entry + 8, little) > 1;
        }
      }
      return false;
    }
    offset += 2 + length;
  }
  return false;
}

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

function drawScaled(bitmap: ImageBitmap, scale: number, background?: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser');
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function encode(bitmap: ImageBitmap, scale: number, quality: number): Promise<Blob> {
  const webp = await canvasToBlob(drawScaled(bitmap, scale), 'image/webp', quality);
  if (webp?.type === 'image/webp') return webp;

  const jpeg = await canvasToBlob(drawScaled(bitmap, scale, '#ffffff'), 'image/jpeg', quality);
  if (!jpeg) throw new Error('Image could not be encoded');
  return jpeg;
}

export async function compressImage(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`${file.name} could not be read as an image`);
  }

  try {
    const baseScale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (
      baseScale === 1 &&
      file.size <= MAX_COMPRESSED_BYTES &&
      PASSTHROUGH_TYPES.has(file.type) &&
      !(await hasExifRotation(file))
    ) {
      return await blobToDataUrl(file);
    }
    for (let scale = baseScale; scale >= baseScale * MIN_SCALE; scale *= 0.8) {
      for (const quality of QUALITY_STEPS) {
        const blob = await encode(bitmap, scale, quality);
        if (blob.size <= MAX_COMPRESSED_BYTES) return await blobToDataUrl(blob);
      }
    }
    throw new Error(`${file.name} is too detailed to compress. Try a smaller image.`);
  } finally {
    bitmap.close();
  }
}
