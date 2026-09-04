export const MAX_AUDIO_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
]);

interface AudioUploadFile {
  name: string;
  size: number;
  type: string;
}

interface StoredAudioUpload {
  storagePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function validateAudioUploadFile(file: AudioUploadFile): string | null {
  if (file.size <= 0) {
    return "Audio file is empty.";
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return "Audio file must be 25 MB or smaller.";
  }

  const hasSupportedExtension = /\.(mp3|wav|m4a)$/i.test(file.name);
  if (!hasSupportedExtension && !SUPPORTED_AUDIO_TYPES.has(file.type)) {
    return "Please select a valid audio file (.mp3, .wav, or .m4a).";
  }

  return null;
}

export function validateStoredAudioUpload(
  upload: StoredAudioUpload,
): string | null {
  const validationError = validateAudioUploadFile({
    name: upload.fileName,
    size: upload.fileSize,
    type: upload.fileType,
  });

  if (validationError) {
    return validationError;
  }

  const generatedUploadPath =
    /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!generatedUploadPath.test(upload.storagePath)) {
    return "Invalid uploaded audio path.";
  }

  return null;
}
