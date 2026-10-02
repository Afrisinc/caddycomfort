const MAX_DIMENSION = 1600;
export const MAX_COMPRESSED_BYTES = 1024 * 1024;
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55, 0.45];
const MIN_SCALE = 0.5;

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
