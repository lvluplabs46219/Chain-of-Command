// packages/auth/src/session.ts
// Session management for Chain of Command

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  getJwtConfig,
  getSessionConfig,
  getSecurityConfig,
} from './config';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  DecodedToken,
  UserSession,
  TokenType,
  UserId,
  SessionId,
  TenantId,
  UserRole,
  Permission,
} from './types';

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Generate a JWT token
 */
export function generateToken<T extends object>(
  payload: T,
  tokenType: TokenType,
  expiresIn?: string,
): string {
  const jwtConfig = getJwtConfig();
  const expiresInFinal = expiresIn || (
    tokenType === 'access_token' ? jwtConfig.accessExpiresIn : jwtConfig.refreshExpiresIn
  );
  
  return jwt.sign(payload as object, jwtConfig.secret, {
    expiresIn: expiresInFinal,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: 'HS256',
    jwtid: uuidv4(),
  });
}

/**
 * Generate an access token
 */
export function generateAccessToken(
  userId: UserId,
  tenantId: TenantId,
  sessionId: SessionId,
  role: UserRole,
  permissions: Permission[],
  email: string,
  authProvider: string,
  mfaVerified: boolean = false,
): string {
  const payload: AccessTokenPayload = {
    sub: userId,
    tenantId,
    sessionId,
    role,
    permissions,
    iat: Math.floor(Date.now() / 1000),
    authProvider: authProvider as any,
    email,
    mfaVerified,
  };
  
  return generateToken<AccessTokenPayload>(payload, 'access_token');
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(
  userId: UserId,
  tenantId: TenantId,
  sessionId: SessionId,
  tokenVersion: number,
): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
    tenantId,
    sessionId,
    jti: uuidv4(),
    iat: Math.floor(Date.now() / 1000),
    tokenVersion,
  };
  
  // Refresh tokens have longer expiration
  return generateToken<RefreshTokenPayload>(payload, 'refresh_token');
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken<T extends object>(
  token: string,
  tokenType: TokenType,
): DecodedToken<T> {
  const jwtConfig = getJwtConfig();
  
  try {
    const payload = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithms: ['HS256'],
    }) as T;
    
    const now = Math.floor(Date.now() / 1000);
    const expired = (payload as any).exp ? (payload as any).exp < now : false;
    
    return {
      payload,
      valid: !expired,
      expired,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid token';
    return {
      payload: {} as T,
      valid: false,
      expired: true,
      error: errorMessage,
    };
  }
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): DecodedToken<AccessTokenPayload> {
  return verifyToken<AccessTokenPayload>(token, 'access_token');
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken<RefreshTokenPayload> {
  return verifyToken<RefreshTokenPayload>(token, 'refresh_token');
}

/**
 * Rotate tokens (generate new access token using refresh token)
 */
export function rotateTokens(
  refreshToken: string,
  generateNewAccessToken: () => string,
): { accessToken: string; newRefreshToken: string } | null {
  const decoded = verifyRefreshToken(refreshToken);
  
  if (!decoded.valid || decoded.expired) {
    return null;
  }
  
  const { sub: userId, tenantId, sessionId, tokenVersion } = decoded.payload;
  
  // Generate new access token
  // Note: In a real implementation, we'd fetch user permissions from DB
  const accessToken = generateNewAccessToken();
  
  // Generate new refresh token with incremented version
  const newRefreshToken = generateRefreshToken(
    userId,
    tenantId,
    sessionId,
    tokenVersion + 1,
  );
  
  return { accessToken, newRefreshToken };
}

// ============================================================================
// PASSWORD HASHING
// ============================================================================

const SALT_ROUNDS = getSecurityConfig().bcryptRounds;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if password needs rehashing (if cost factor has changed)
 */
export async function needsRehash(hash: string): Promise<boolean> {
  // Extract the salt rounds from the hash
  const rounds = hash.split('$')[2];
  if (!rounds) return false;
  
  const currentRounds = SALT_ROUNDS.toString();
  return rounds !== currentRounds;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new user session
 */
export function createSession(
  userId: UserId,
  tenantId: TenantId,
  ipAddress?: string,
  userAgent?: string,
): UserSession {
  const session: UserSession = {
    id: uuidv4() as SessionId,
    userId,
    tenantId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + getSessionConfig().timeoutHours * 60 * 60 * 1000),
    ipAddress,
    userAgent,
    mfaVerified: false,
    tokenVersion: 0,
  };
  
  return session;
}

/**
 * Validate a session
 */
export function validateSession(session: UserSession): boolean {
  const sessionConfig = getSessionConfig();
  const now = new Date();
  
  // Check if session has expired
  if (session.expiresAt < now) {
    return false;
  }
  
  // Additional validation logic can be added here
  // (e.g., check if session is in the database, check IP, etc.)
  
  return true;
}

/**
 * Invalidate a session
 */
export function invalidateSession(session: UserSession): UserSession {
  return {
    ...session,
    expiresAt: new Date(0), // Set to past date
  };
}

/**
 * Get session timeout in milliseconds
 */
export function getSessionTimeoutMs(): number {
  return getSessionConfig().timeoutHours * 60 * 60 * 1000;
}

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Cookie options for session cookie
 */
export function getSessionCookieOptions(secure: boolean = isProduction()) {
  const sessionConfig = getSessionConfig();
  
  return {
    name: sessionConfig.cookieName,
    httpOnly: sessionConfig.cookieHttpOnly,
    secure: secure && sessionConfig.cookieSecure,
    sameSite: sessionConfig.cookieSameSite as 'lax' | 'strict' | 'none',
    maxAge: getSessionTimeoutMs(),
    path: '/',
  };
}

/**
 * Parse session from cookie
 */
export function parseSessionCookie(cookieValue: string | undefined): UserSession | null {
  if (!cookieValue) {
    return null;
  }
  
  try {
    // In a real implementation, this would verify the cookie signature
    // For now, we'll just parse it (assuming it's already verified by middleware)
    const session: UserSession = JSON.parse(cookieValue);
    return session;
  } catch {
    return null;
  }
}

// ============================================================================
// TOKEN BLACKLIST (for immediate revocation)
// ============================================================================

// In-memory store for revoked tokens (in production, use Redis)
const revokedTokens = new Set<string>();

/**
 * Revoke a token (add to blacklist)
 */
export function revokeToken(token: string, ttlMs: number = getSessionTimeoutMs()): void {
  revokedTokens.add(token);
  
  // In production, you'd set a TTL in Redis
  // For now, we'll just keep it in memory (cleared on restart)
  setTimeout(() => {
    revokedTokens.delete(token);
  }, ttlMs);
}

/**
 * Check if a token is revoked
 */
export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

/**
 * Clear all revoked tokens (useful for testing)
 */
export function clearRevokedTokens(): void {
  revokedTokens.clear();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a random token (for email verification, password reset, etc.)
 */
export function generateRandomToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a backup code for MFA
 */
export function generateBackupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a backup code for storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  return hashPassword(code);
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(code: string, hash: string): Promise<boolean> {
  return verifyPassword(code, hash);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
