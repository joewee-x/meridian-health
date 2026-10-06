const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'ssn',
  'dateOfBirth',
  'dob',
  'card',
  'cvv',
  'memberId',
]);

function redact(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : redact(val);
    }
    return out;
  }
  return value;
}

const logger = {
  info(message, meta) {
    if (meta) console.log(`[INFO] ${message}`, redact(meta));
    else console.log(`[INFO] ${message}`);
  },
  warn(message, meta) {
    if (meta) console.warn(`[WARN] ${message}`, redact(meta));
    else console.warn(`[WARN] ${message}`);
  },
  error(message, meta) {
    if (meta) console.error(`[ERROR] ${message}`, redact(meta));
    else console.error(`[ERROR] ${message}`);
  },
};

module.exports = { logger, redact };
