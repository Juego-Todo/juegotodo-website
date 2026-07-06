export type CropTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const PROFILE_CROP_VIEWPORT_SIZE = 280;
export const PROFILE_CROP_OUTPUT_SIZE = 512;

export function getCoverBaseScale(imageWidth: number, imageHeight: number, viewportSize: number) {
  return Math.max(viewportSize / imageWidth, viewportSize / imageHeight);
}

export function clampCropOffset(
  imageWidth: number,
  imageHeight: number,
  scale: number,
  viewportSize: number,
  offsetX: number,
  offsetY: number,
): { offsetX: number; offsetY: number } {
  const totalScale = getCoverBaseScale(imageWidth, imageHeight, viewportSize) * scale;
  const displayedW = imageWidth * totalScale;
  const displayedH = imageHeight * totalScale;

  const minX = viewportSize - displayedW;
  const minY = viewportSize - displayedH;

  return {
    offsetX: Math.min(0, Math.max(minX, offsetX)),
    offsetY: Math.min(0, Math.max(minY, offsetY)),
  };
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = src;
  });
}

export async function cropImageToSquare(
  imageSrc: string,
  transform: CropTransform,
  viewportSize = PROFILE_CROP_VIEWPORT_SIZE,
  outputSize = PROFILE_CROP_OUTPUT_SIZE,
): Promise<string> {
  const image = await loadImageElement(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare image crop.");
  }

  const totalScale = getCoverBaseScale(image.width, image.height, viewportSize) * transform.scale;
  const displayedW = image.width * totalScale;
  const displayedH = image.height * totalScale;
  const imageX = (viewportSize - displayedW) / 2 + transform.offsetX;
  const imageY = (viewportSize - displayedH) / 2 + transform.offsetY;

  const cropX = (0 - imageX) / totalScale;
  const cropY = (0 - imageY) / totalScale;
  const cropSize = viewportSize / totalScale;

  context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, outputSize, outputSize);

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
