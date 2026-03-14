type RawEnv = Record<string, unknown>;

type LogFormat = "pretty" | "json";

function readString(
  env: RawEnv,
  key: string,
  options?: { defaultValue?: string; required?: boolean },
) {
  const raw = env[key];
  const value = typeof raw === "string" ? raw.trim() : "";

  if (value) {
    return value;
  }

  if (options?.defaultValue !== undefined) {
    return options.defaultValue;
  }

  if (options?.required) {
    throw new Error(`Environment variable ${key} is required`);
  }

  return undefined;
}

function readNumber(
  env: RawEnv,
  key: string,
  options?: { defaultValue?: number; min?: number },
) {
  const raw = readString(env, key);

  if (raw === undefined) {
    return options?.defaultValue;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  if (options?.min !== undefined && value < options.min) {
    throw new Error(
      `Environment variable ${key} must be greater than or equal to ${options.min}`,
    );
  }

  return value;
}

function readBoolean(
  env: RawEnv,
  key: string,
  options?: { defaultValue?: boolean },
) {
  const raw = readString(env, key);

  if (raw === undefined) {
    return options?.defaultValue ?? false;
  }

  if (["true", "1", "yes", "on"].includes(raw.toLowerCase())) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(raw.toLowerCase())) {
    return false;
  }

  throw new Error(`Environment variable ${key} must be a boolean`);
}

function readLogFormat(env: RawEnv, key: string, defaultValue: LogFormat) {
  const raw = readString(env, key, { defaultValue });
  if (raw === "pretty" || raw === "json") {
    return raw;
  }

  throw new Error(`Environment variable ${key} must be "pretty" or "json"`);
}

function readAllowedOrigins(env: RawEnv) {
  return readString(env, "ALLOWED_ORIGINS", {
    defaultValue: "http://localhost:3000",
  });
}

export function validateEnvironment(env: RawEnv) {
  const nodeEnv = readString(env, "NODE_ENV", {
    defaultValue: "development",
  });

  if (
    nodeEnv !== "development" &&
    nodeEnv !== "test" &&
    nodeEnv !== "production"
  ) {
    throw new Error(
      'Environment variable NODE_ENV must be "development", "test", or "production"',
    );
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: readNumber(env, "PORT", { defaultValue: 3001, min: 1 }),
    TRUST_PROXY: readBoolean(env, "TRUST_PROXY", { defaultValue: false }),
    DATABASE_URL: readString(env, "DATABASE_URL", { required: true }),
    JWT_SECRET: readString(env, "JWT_SECRET", { required: true }),
    JWT_EXPIRES_IN: readString(env, "JWT_EXPIRES_IN", { defaultValue: "7d" }),
    ALLOWED_ORIGINS: readAllowedOrigins(env),
    APP_URL: readString(env, "APP_URL", {
      defaultValue: "http://localhost:3000",
    }),
    SMTP_HOST: readString(env, "SMTP_HOST"),
    SMTP_PORT: readNumber(env, "SMTP_PORT", { defaultValue: 587, min: 1 }),
    SMTP_USER: readString(env, "SMTP_USER"),
    SMTP_PASS: readString(env, "SMTP_PASS"),
    SMTP_FROM: readString(env, "SMTP_FROM", {
      defaultValue: "ControlMe <noreply@controlme.app>",
    }),
    EMAIL_REMINDER_CRON: readString(env, "EMAIL_REMINDER_CRON", {
      defaultValue: "0 8 * * *",
    }),
    EMAIL_REMINDER_TIMEZONE: readString(env, "EMAIL_REMINDER_TIMEZONE", {
      defaultValue: "UTC",
    }),
    REDIS_URL: readString(env, "REDIS_URL", { required: true }),
    REDIS_CONNECT_TIMEOUT_MS: readNumber(env, "REDIS_CONNECT_TIMEOUT_MS", {
      defaultValue: 10_000,
      min: 100,
    }),
    CACHE_TTL_SECONDS: readNumber(env, "CACHE_TTL_SECONDS", {
      defaultValue: 120,
      min: 1,
    }),
    THROTTLE_TTL_MS: readNumber(env, "THROTTLE_TTL_MS", {
      defaultValue: 60_000,
      min: 1000,
    }),
    THROTTLE_LIMIT: readNumber(env, "THROTTLE_LIMIT", {
      defaultValue: 100,
      min: 1,
    }),
    THROTTLE_BLOCK_MS: readNumber(env, "THROTTLE_BLOCK_MS", {
      defaultValue: 300_000,
      min: 1000,
    }),
    AUTH_THROTTLE_TTL_MS: readNumber(env, "AUTH_THROTTLE_TTL_MS", {
      defaultValue: 60_000,
      min: 1000,
    }),
    AUTH_THROTTLE_LIMIT: readNumber(env, "AUTH_THROTTLE_LIMIT", {
      defaultValue: 10,
      min: 1,
    }),
    AUTH_THROTTLE_BLOCK_MS: readNumber(env, "AUTH_THROTTLE_BLOCK_MS", {
      defaultValue: 300_000,
      min: 1000,
    }),
    PASSWORD_RESET_THROTTLE_LIMIT: readNumber(
      env,
      "PASSWORD_RESET_THROTTLE_LIMIT",
      {
        defaultValue: 5,
        min: 1,
      },
    ),
    PASSWORD_RESET_THROTTLE_BLOCK_MS: readNumber(
      env,
      "PASSWORD_RESET_THROTTLE_BLOCK_MS",
      {
        defaultValue: 600_000,
        min: 1000,
      },
    ),
    QUEUE_PREFIX: readString(env, "QUEUE_PREFIX", {
      defaultValue: "controlme",
    }),
    QUEUE_CONCURRENCY: readNumber(env, "QUEUE_CONCURRENCY", {
      defaultValue: 5,
      min: 1,
    }),
    METRICS_ENABLED: readBoolean(env, "METRICS_ENABLED", {
      defaultValue: true,
    }),
    LOG_FORMAT: readLogFormat(env, "LOG_FORMAT", "pretty"),
    APP_VERSION: readString(env, "APP_VERSION", { defaultValue: "0.1.0" }),
  };
}
