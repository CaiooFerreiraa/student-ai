const CONTROL_CHARACTERS_REGEX: RegExp = /[\u0000-\u001F\u007F]/g;
const MULTIPLE_SPACES_REGEX: RegExp = /\s+/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype: object | null = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function sanitizeString(value: string): string {
  return value
    .normalize("NFKC")
    .replace(CONTROL_CHARACTERS_REGEX, "")
    .replace(MULTIPLE_SPACES_REGEX, " ")
    .trim();
}

export function sanitizeUnknown<TValue>(value: TValue): TValue {
  if (typeof value === "string") {
    return sanitizeString(value) as TValue;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => sanitizeUnknown(item)) as TValue;
  }

  if (isPlainObject(value)) {
    const sanitizedEntries: Array<[string, unknown]> = Object.entries(value).map(
      ([key, entryValue]: [string, unknown]) => [key, sanitizeUnknown(entryValue)],
    );

    return Object.fromEntries(sanitizedEntries) as TValue;
  }

  return value;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character: string) => HTML_ESCAPE_MAP[character] ?? character);
}
