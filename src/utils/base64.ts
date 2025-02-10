import Compressor from "compressorjs";

export async function filesToBase64(fileList: File[]): Promise<string[]> {
  // create function which return resolved promise
  // with data:base64 string
  function getBase64(file: File) {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (ev) => {
        resolve(ev.target!.result);
      };
      reader.readAsDataURL(file);
    });
  }
  // here will be array of promisified functions
  const promises = [];

  // loop through fileList with for loop
  for (const file of fileList) {
    promises.push(getBase64(file));
  }

  // array with base64 strings
  return await Promise.all(promises) as string[];
}

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    new Compressor(file, {
      quality: 0.6,
      maxHeight: 1422,
      maxWidth: 800,
      success(result) {
        resolve(result as File);
      },
    });
  });
}
