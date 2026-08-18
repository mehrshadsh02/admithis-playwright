const sensitiveKeyPattern =
  /token|password|passwd|pwd|cookie|authorization|auth|bearer|secret|api[-_]?key|session/i;

const bearerPattern = /bearer\s+[a-z0-9._~+/=-]+/gi;
const assignmentPattern =
  /\b(token|password|passwd|pwd|cookie|authorization|auth|secret|api[-_]?key|apikey|session)\s*[:=]\s*[^,\s;]+/gi;

export const REDACTED = '[REDACTED]';

export function sanitizeForLog(value: unknown): unknown {
  return sanitizeValue(value, new WeakSet<object>());
}

export function serializeForLog(value: unknown): string {
  const sanitized = sanitizeForLog(value);

  try {
    return (
      JSON.stringify(sanitized, (_key, nestedValue: unknown) =>
        typeof nestedValue === 'bigint' ? `${nestedValue}n` : nestedValue,
      ) ?? 'undefined'
    );
  } catch {
    return JSON.stringify(String(sanitized));
  }
}

function sanitizeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return sanitizeError(value, seen);
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  if (value && typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sensitiveKeyPattern.test(key) ? REDACTED : sanitizeValue(item, seen),
      ]),
    );
  }

  return value;
}

function sanitizeError(error: Error, seen: WeakSet<object>): Record<string, unknown> {
  const details: Record<string, unknown> = {
    name: error.name,
    message: sanitizeValue(error.message, seen),
  };

  if (error.stack) {
    details.stack = sanitizeValue(error.stack, seen);
  }

  if (error.cause) {
    details.cause = sanitizeValue(error.cause, seen);
  }

  return details;
}

function redactString(value: string): string {
  return value
    .replace(bearerPattern, `Bearer ${REDACTED}`)
    .replace(assignmentPattern, (_match, key) => {
      return `${key}=${REDACTED}`;
    });
}
