// Background removal via Cloudinary (unsigned upload + transformation)
// This avoids bundling heavy ML models into the client and keeps bundle size small.

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

// Uploads the image to Cloudinary (unsigned) then requests the background-removed
// transformed image and returns it as a Blob.
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing (VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
  console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);

  // Convert to blob for upload
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9));
  if (!blob) throw new Error('Failed to convert canvas to blob');

  // Upload to Cloudinary (unsigned)
  const form = new FormData();
  form.append('file', blob, 'upload.jpg');
  form.append('upload_preset', uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const uploadResp = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    throw new Error(`Cloudinary upload failed: ${uploadResp.status} ${text}`);
  }

  const json = await uploadResp.json();
  // json.public_id and json.format are returned
  const publicId: string = json.public_id;
  const format: string = json.format || 'png';

  // Build transformation URL to remove background and return PNG to preserve transparency
  // e_background_removal is Cloudinary's AI-driven effect
  const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/${publicId}.${format}`;

  const transformedResp = await fetch(transformedUrl);
  if (!transformedResp.ok) {
    const text = await transformedResp.text();
    throw new Error(`Cloudinary transformation failed: ${transformedResp.status} ${text}`);
  }

  const resultBlob = await transformedResp.blob();
  return resultBlob;
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
