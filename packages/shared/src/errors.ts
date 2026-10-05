/**
 * Stable error taxonomy — API contract (§24.3 Master Implementation Prompt v2.0)
 * Every error maps to a plain-language user message and (where relevant) a next action.
 * Codes are stable contracts; do not rename without a versioned migration.
 */

export const ErrorCodes = {
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

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    traceId: string;
    nextAction?: string;
  };
}

/** Plain-language messages for end users (never expose internal stack traces). */
export const ERROR_USER_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: 'You need to sign in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'We could not find what you asked for.',
  VALIDATION_FAILED: 'Some of the information provided was invalid. Please check and try again.',
  CONFLICT: 'This change conflicts with the current state. Refresh and try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  BUDGET_EXCEEDED: 'The AI usage budget for this case or request has been reached.',
  APPROVAL_REQUIRED: 'This action requires your explicit approval before it can proceed.',
  APPROVAL_INVALID: 'The approval is invalid, expired, or does not match the requested action.',
  CAPABILITY_NOT_VERIFIED:
    'This capability has not been verified for your jurisdiction or court. The platform will not pretend it works.',
  RULE_NOT_FOUND:
    'A deadline may apply here, but we could not verify the rule for your jurisdiction. Please check with the court or an attorney.',
  GROUNDING_FAILED:
    'We could not ground this legal statement in a verified source. Do not rely on it as settled law.',
  PROVIDER_ERROR: 'The AI provider encountered an error. Please try again shortly.',
  SAFETY_BLOCKED: 'This request was blocked by safety controls.',
  INJECTION_FLAGGED: 'Untrusted content contained patterns that could hijack the system. The action was refused.',
  INTERNAL: 'Something went wrong on our side. Please try again or contact support with the trace ID.',
};

export class PlatformError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly traceId: string;
  readonly nextAction?: string;
  readonly httpStatus: number;

  constructor(opts: {
    code: ErrorCode;
    message?: string;
    details?: unknown;
    traceId: string;
    nextAction?: string;
    httpStatus?: number;
  }) {
    const msg = opts.message ?? ERROR_USER_MESSAGES[opts.code];
    super(msg);
    this.name = 'PlatformError';
    this.code = opts.code;
    this.details = opts.details;
    this.traceId = opts.traceId;
    this.nextAction = opts.nextAction;
    this.httpStatus = opts.httpStatus ?? defaultHttpStatus(opts.code);
  }

  toApiBody(): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        traceId: this.traceId,
        nextAction: this.nextAction,
      },
    };
  }
}

function defaultHttpStatus(code: ErrorCode): number {
  switch (code) {
    case 'UNAUTHENTICATED':
      return 401;
    case 'FORBIDDEN':
    case 'APPROVAL_REQUIRED':
    case 'APPROVAL_INVALID':
    case 'INJECTION_FLAGGED':
    case 'SAFETY_BLOCKED':
      return 403;
    case 'NOT_FOUND':
    case 'RULE_NOT_FOUND':
    case 'CAPABILITY_NOT_VERIFIED':
      return 404;
    case 'VALIDATION_FAILED':
      return 400;
    case 'CONFLICT':
      return 409;
    case 'RATE_LIMITED':
      return 429;
    case 'BUDGET_EXCEEDED':
      return 402;
    case 'GROUNDING_FAILED':
      return 422;
    case 'PROVIDER_ERROR':
      return 502;
    default:
      return 500;
  }
}
