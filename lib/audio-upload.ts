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
