// packages/auth/src/config.ts
// Configuration management for authentication and authorization

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ override: true });

// ============================================================================
// AUTH CONFIGURATION SCHEMA
// ============================================================================

const AuthConfigSchema = z.object({
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('chain-of-command'),
  JWT_AUDIENCE: z.string().default('chain-of-command-api'),
  
  // Session Configuration
  SESSION_SECRET: z.string().min(32),
  SESSION_TIMEOUT_HOURS: z.coerce.number().int().positive().default(24),
  SESSION_COOKIE_NAME: z.string().default('coc_session'),
  SESSION_COOKIE_SECURE: z.coerce.boolean().default(true),
  SESSION_COOKIE_HTTP_ONLY: z.coerce.boolean().default(true),
  SESSION_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // MFA Configuration
  MFA_ENABLED: z.coerce.boolean().default(false),
  MFA_ISSUER: z.string().default('Chain of Command'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  
  // Security
  PASSWORD_MIN_LENGTH: z.coerce.number().int().positive().default(12),
  PASSWORD_BCRYPT_ROUNDS: z.coerce.number().int().positive().default(12),
  TOKEN_ROTATION_ENABLED: z.coerce.boolean().default(true),
  
  // CORS
  ALLOWED_ORIGINS: z.string().optional(),
  ALLOW_PREVIEW_CORS: z.coerce.boolean().default(false),
  
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  
  // Tenancy
  DEFAULT_TENANT_ID: z.string().uuid().optional(),
  
  // Feature flags (can be overridden per-tenant)
  FEATURE_MULTI_TENANT: z.coerce.boolean().default(false),
  FEATURE_MFA: z.coerce.boolean().default(false),
  FEATURE_AI_AGENTS: z.coerce.boolean().default(true),
  FEATURE_LEGAL_RESEARCH: z.coerce.boolean().default(true),
  FEATURE_DOCUMENT_ANALYSIS: z.coerce.boolean().default(true),
  
  // Model Gateway
  MODEL_GATEWAY_ENABLED: z.coerce.boolean().default(true),
  ALLOWED_MODEL_PROVIDERS: z.string().optional(),
});

// ============================================================================
// CONFIG VALIDATION
// ============================================================================

export interface AuthConfig extends z.infer<typeof AuthConfigSchema> {}

let validatedConfig: AuthConfig | null = null;

export function getAuthConfig(): AuthConfig {
  if (validatedConfig) {
    return validatedConfig;
  }
  
  const result = AuthConfigSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => {
      return `  - ${issue.path.join('.')}: ${issue.message}`;
    });
    
    throw new Error(
      `Invalid authentication configuration:\n${errors.join('\n')}\n\n` +
      `Please ensure all required environment variables are set.`
    );
  }
  
  validatedConfig = result.data;
  return validatedConfig;
}

// Reset config (useful for testing)
export function resetAuthConfig(): void {
  validatedConfig = null;
}

// ============================================================================
// CONFIG ACCESSORS
// ============================================================================

export function getJwtConfig() {
  const config = getAuthConfig();
  return {
    secret: config.JWT_SECRET,
    accessExpiresIn: config.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
  };
}

export function getSessionConfig() {
  const config = getAuthConfig();
  return {
    secret: config.SESSION_SECRET,
    timeoutHours: config.SESSION_TIMEOUT_HOURS,
    cookieName: config.SESSION_COOKIE_NAME,
    cookieSecure: config.SESSION_COOKIE_SECURE,
    cookieHttpOnly: config.SESSION_COOKIE_HTTP_ONLY,
    cookieSameSite: config.SESSION_COOKIE_SAME_SITE,
  };
}

export function getSecurityConfig() {
  const config = getAuthConfig();
  return {
    passwordMinLength: config.PASSWORD_MIN_LENGTH,
    bcryptRounds: config.PASSWORD_BCRYPT_ROUNDS,
    tokenRotationEnabled: config.TOKEN_ROTATION_ENABLED,
    rateLimitWindowMs: config.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  };
}

export function getFeatureConfig() {
  const config = getAuthConfig();
  return {
    multiTenant: config.FEATURE_MULTI_TENANT,
    mfa: config.FEATURE_MFA,
    aiAgents: config.FEATURE_AI_AGENTS,
    legalResearch: config.FEATURE_LEGAL_RESEARCH,
    documentAnalysis: config.FEATURE_DOCUMENT_ANALYSIS,
  };
}

// ============================================================================
// ENVIRONMENT CHECKS
// ============================================================================

export function isProduction(): boolean {
  return getAuthConfig().NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return getAuthConfig().NODE_ENV === 'development';
}

export function isTest(): boolean {
  return getAuthConfig().NODE_ENV === 'test';
}

export function requireProduction(message?: string): void {
  if (!isProduction()) {
    throw new Error(message || 'This operation is only allowed in production');
  }
}

// ============================================================================
// CONFIG VALIDATION FOR STARTUP
// ============================================================================

export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  const result = AuthConfigSchema.safeParse(process.env);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  const errors = result.error.issues.map(issue => {
    return `${issue.path.join('.')}: ${issue.message}`;
  });
  
  return { valid: false, errors };
}
