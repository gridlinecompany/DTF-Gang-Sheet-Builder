
export const fileToBase64 = (file: File): Promise<{base64: string, width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      const base64 = reader.result as string;
      img.src = base64;
      img.onload = () => {
        resolve({ base64, width: img.width, height: img.height });
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};