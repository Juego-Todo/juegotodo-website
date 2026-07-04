const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export async function readUploadAsDataUrl(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} exceeds the 2MB upload limit.`);
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read the selected file."));
    };
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}
