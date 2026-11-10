import { ApiError } from "./client";
import { ApiErrorBody, UploadedFile } from "./types";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/**
 * Uploads an image and returns its URL (served by the API through /api/backend/files/...).
 * Pass `projectId` for images that belong to a project, so only its members can open them.
 */
export async function uploadImage(file: Blob, options: { projectId?: string; filename?: string } = {}) {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new ApiError(415, "UNSUPPORTED_FILE", "Only PNG, JPEG, GIF and WebP images can be uploaded.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "FILE_TOO_LARGE", "Images can be up to 5 MB.");
  }

  const form = new FormData();
  form.append("file", file, options.filename ?? (file instanceof File ? file.name : "image"));
  if (options.projectId) form.append("projectId", options.projectId);

  let res: Response;
  try {
    res = await fetch("/api/backend/files", { method: "POST", body: form });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "You appear to be offline.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(res.status, body.code ?? "UPLOAD_FAILED", body.message ?? "The image couldn't be uploaded.");
  }
  return (await res.json()) as UploadedFile;
}

/** Turns a data URL (e.g. from the image cropper) into a Blob for uploading. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}
