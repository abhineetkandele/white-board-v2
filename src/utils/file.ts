/**
 * File handling utilities: image loading, hashing, and data URL conversion.
 */

const bytesToHexString = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => `0${byte.toString(16)}`.slice(-2))
    .join("");
};

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if ("arrayBuffer" in blob) {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't convert blob to ArrayBuffer"));
      }
      resolve(event.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

export const generateFileId = async (file: File): Promise<string> => {
  try {
    const hashBuffer = await window.crypto.subtle.digest(
      "SHA-1",
      await blobToArrayBuffer(file),
    );
    return bytesToHexString(new Uint8Array(hashBuffer));
  } catch (error) {
    console.error("Failed to generate file ID:", error);
    return URL.createObjectURL(file).substr(-40);
  }
};

export const loadImage = (
  e: Event,
  onImageLoad: (
    img: HTMLImageElement,
    width: number,
    height: number,
    dataUrl: string,
    fileId: string,
  ) => void,
): void => {
  const target = e.target as HTMLInputElement;
  const imageFile = target.files?.[0];

  if (!imageFile) return;

  const fileIdPromise = generateFileId(imageFile);
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    const img = new Image();
    img.onload = async () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const width = 200;
      const height = width / aspectRatio;
      const fileId = await fileIdPromise;
      onImageLoad(img, width, height, reader.result as string, fileId);
    };
    img.src = reader.result as string;
  });

  reader.readAsDataURL(imageFile);
};
