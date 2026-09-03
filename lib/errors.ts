type ErrorDetails = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
};

export function formatUnknownError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const candidate = error as ErrorDetails;
  if (typeof candidate.message !== "string" || !candidate.message) {
    return fallback;
  }

  const context = [
    ["code", candidate.code],
    ["details", candidate.details],
    ["hint", candidate.hint],
  ]
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]))
    .map(([label, value]) => `${label}: ${value}`);

  return context.length > 0
    ? `${candidate.message} (${context.join("; ")})`
    : candidate.message;
}
