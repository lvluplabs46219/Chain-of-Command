/**
 * Stable error taxonomy for Chain of Command API (§24.2).
 * Never return bare strings; always use these codes.
 */

export const ErrorCode = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  APPROVAL_INVALID: 'APPROVAL_INVALID',
  CAPABILITY_NOT_VERIFIED: 'CAPABILITY_NOT_VERIFIED',
  RULE_NOT_FOUND: 'RULE_NOT_FOUND',
  GROUNDING_FAILED: 'GROUNDING_FAILED',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  SAFETY_BLOCKED: 'SAFETY_BLOCKED',
  INJECTION_FLAGGED: 'INJECTION_FLAGGED',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    traceId?: string;
  };
}

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: 'Authentication required.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'The request failed validation.',
  CONFLICT: 'The request conflicts with the current state.',
  RATE_LIMITED: 'Rate limit exceeded. Please try again later.',
  BUDGET_EXCEEDED: 'Cost or token budget exceeded for this request.',
  APPROVAL_REQUIRED: 'This action requires explicit human approval.',
  APPROVAL_INVALID: 'The provided approval is invalid, expired, or already used.',
  CAPABILITY_NOT_VERIFIED: 'This capability has not been verified for the target system.',
  RULE_NOT_FOUND: 'No verified rule matched; a deadline may still apply.',
  GROUNDING_FAILED: 'Unable to ground legal claims in verified authorities.',
  PROVIDER_ERROR: 'Upstream model or service provider error.',
  SAFETY_BLOCKED: 'The request was blocked by a safety policy.',
  INJECTION_FLAGGED: 'Potentially unsafe content was detected and blocked.',
  INTERNAL: 'An unexpected internal error occurred.',
};

export function makeError(
  code: ErrorCode,
  message?: string,
  details?: unknown,
  traceId?: string
): ApiErrorBody {
  return {
    error: {
      code,
      message: message ?? DEFAULT_MESSAGES[code],
      details,
      traceId,
    },
  };
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly traceId?: string;
  readonly httpStatus: number;

  constructor(
    code: ErrorCode,
    message?: string,
    opts?: { details?: unknown; traceId?: string; httpStatus?: number }
  ) {
    super(message ?? DEFAULT_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.details = opts?.details;
    this.traceId = opts?.traceId;
    this.httpStatus = opts?.httpStatus ?? statusForCode(code);
  }

  toBody(): ApiErrorBody {
    return makeError(this.code, this.message, this.details, this.traceId);
  }
}

function statusForCode(code: ErrorCode): number {
  switch (code) {
    case 'UNAUTHENTICATED': return 401;
    case 'FORBIDDEN':
    case 'APPROVAL_REQUIRED':
    case 'APPROVAL_INVALID':
    case 'SAFETY_BLOCKED':
    case 'INJECTION_FLAGGED':
      return 403;
    case 'NOT_FOUND':
    case 'RULE_NOT_FOUND':
    case 'CAPABILITY_NOT_VERIFIED':
      return 404;
    case 'VALIDATION_FAILED': return 400;
    case 'CONFLICT': return 409;
    case 'RATE_LIMITED': return 429;
    case 'BUDGET_EXCEEDED': return 402;
    case 'PROVIDER_ERROR':
    case 'GROUNDING_FAILED':
    case 'INTERNAL':
    default:
      return 500;
  }
}
