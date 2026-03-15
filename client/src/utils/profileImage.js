export const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة المحددة."));
    reader.readAsDataURL(file);
  });
}

export async function readProfileImageFile(file) {
  if (!file) {
    throw new Error("يرجى اختيار صورة صالحة.");
  }

  if (!ACCEPTED_PROFILE_IMAGE_TYPES.includes(file.type)) {
    throw new Error("نوع الصورة غير مدعوم. استخدم PNG أو JPG أو WEBP أو GIF.");
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    throw new Error("حجم الصورة يجب ألا يتجاوز 2 ميجابايت.");
  }

  const result = await readFileAsDataUrl(file);
  if (typeof result !== "string") {
    throw new Error("تعذر تجهيز صورة البروفايل.");
  }

  return result;
}
