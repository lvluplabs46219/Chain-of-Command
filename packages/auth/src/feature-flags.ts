// packages/auth/src/feature-flags.ts
// Feature flags management for Chain of Command

import {
  FeatureFlag,
  FeatureFlagResult,
} from './types';
import { getFeatureConfig, isProduction, isDevelopment } from './config';
import { UserRole, AuthorizationContext } from './types';

// ============================================================================
// FEATURE FLAG DEFINITIONS
// ============================================================================

/**
 * All available feature flags with their defaults
 */
export const FEATURE_FLAGS: Record<string, Omit<FeatureFlag, 'id'>> = {
  // Core features
  multi_tenant: {
    name: 'Multi-Tenant Support',
    description: 'Enable multi-tenant architecture',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin'],
    env: 'development',
  },
  
  // Authentication
  mfa: {
    name: 'Multi-Factor Authentication',
    description: 'Require MFA for sensitive operations',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'development',
  },
  mfa_enforcement: {
    name: 'MFA Enforcement',
    description: 'Enforce MFA for all users (not just pro users)',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin'],
    env: 'development',
  },
  
  // AI Features
  ai_agents: {
    name: 'AI Agents',
    description: 'Enable AI agent functionality',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  agent_team_ui: {
    name: 'Agent Team UI',
    description: 'Enable UI for managing AI agent teams',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  user_created_agents: {
    name: 'User-Created Agents',
    description: 'Allow users to create custom agents',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin', 'pro_user'],
    env: 'development',
  },
  
  // Legal Research
  legal_research: {
    name: 'Legal Research Engine',
    description: 'Enable legal research with citations',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  rag_ingestion: {
    name: 'RAG Ingestion Pipeline',
    description: 'Enable ingestion of legal authorities into RAG',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin'],
    env: 'all',
  },
  
  web_grounding: {
    name: 'Web Grounding',
    description: 'Allow AI models to ground using web search',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin'],
    env: 'development',
  },
  
  // Document Features
  document_analysis: {
    name: 'Document Analysis',
    description: 'Enable AI-powered document analysis',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  document_drafting: {
    name: 'Document Drafting',
    description: 'Enable AI-assisted document drafting',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  document_state_machine: {
    name: 'Document State Machine',
    description: 'Enforce document state machine (draft → user_edited → user_approved → final)',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  // Case Intelligence
  charge_explainer: {
    name: 'Charge Explainer Agent',
    description: 'Enable charge explanation AI agent',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  rights_checker: {
    name: 'Rights Checker Agent',
    description: 'Enable rights checking AI agent',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  timeline_builder: {
    name: 'Timeline Builder Agent',
    description: 'Enable timeline building AI agent',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  plea_decision_assistant: {
    name: 'Plea Decision Assistant',
    description: 'Enable plea decision structuring agent (NEVER recommends)',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  // Deadline Engine
  deadline_engine: {
    name: 'Deadline Engine',
    description: 'Enable deterministic deadline calculation',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  court_connectors: {
    name: 'Court Connectors',
    description: 'Enable court system connectors (read-only)',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin'],
    env: 'development',
  },
  
  // Attorney Directory
  attorney_directory: {
    name: 'Attorney Directory',
    description: 'Enable attorney directory (neutral, no recommendations)',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  sponsored_listings: {
    name: 'Sponsored Listings',
    description: 'Enable sponsored attorney listings (separate and labeled)',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin'],
    env: 'development',
  },
  
  // Model Gateway
  model_gateway: {
    name: 'Model Gateway',
    description: 'Enable model gateway with routing and fallback',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  ollama_provider: {
    name: 'Ollama Provider',
    description: 'Enable Ollama as a model provider',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'development',
  },
  
  gemini_provider: {
    name: 'Gemini Provider',
    description: 'Enable Google Gemini as a model provider',
    enabled: true,
    rolloutPercentage: 100,
    rolloutTo: ['admin', 'pro_user', 'user'],
    env: 'all',
  },
  
  // Testing
  adversarial_tests: {
    name: 'Adversarial Test Suite',
    description: 'Run adversarial tests that attempt to violate invariants',
    enabled: !isProduction(), // Always enabled in non-production
    rolloutPercentage: 100,
    rolloutTo: ['admin'],
    env: isProduction() ? 'production' : 'all',
  },
  
  // Analytics
  analytics: {
    name: 'Analytics Collection',
    description: 'Collect usage analytics (anonymized)',
    enabled: false,
    rolloutPercentage: 0,
    rolloutTo: ['admin'],
    env: 'development',
  },
  
  // Observability
  tracing: {
    name: 'Distributed Tracing',
    description: 'Enable distributed tracing for observability',
    enabled: !isProduction(), // Enabled in development, configurable in production
    rolloutPercentage: 100,
    rolloutTo: ['admin'],
    env: 'all',
  },
};

// ============================================================================
// FEATURE FLAG MANAGEMENT
// ============================================================================

/**
 * All feature flags with full definitions
 */
const ALL_FEATURE_FLAGS: Record<string, FeatureFlag> = Object.entries(FEATURE_FLAGS).reduce(
  (acc, [id, flag]) => {
    acc[id] = { id, ...flag };
    return acc;
  },
  {} as Record<string, FeatureFlag>,
);

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(
  flagId: string,
  context?: AuthorizationContext,
): FeatureFlagResult {
  const flag = ALL_FEATURE_FLAGS[flagId];
  
  if (!flag) {
    return {
      flag: { id: flagId, name: flagId, description: '', enabled: false, rolloutPercentage: 0, rolloutTo: [], env: 'all' },
      enabled: false,
      reason: 'flag_not_found' as const,
    };
  }
  
  // Check environment
  if (flag.env !== 'all' && flag.env !== process.env.NODE_ENV) {
    return {
      flag,
      enabled: false,
      reason: 'env_excluded',
    };
  }
  
  // Check if feature is globally disabled
  if (!flag.enabled) {
    return {
      flag,
      enabled: false,
      reason: 'disabled',
    };
  }
  
  // If no context provided, check base enabled state
  if (!context) {
    return {
      flag,
      enabled: true,
      reason: 'enabled',
    };
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    const userHash = hashUserId(context.userId);
    const rolloutValue = userHash % 100;
    
    if (rolloutValue >= flag.rolloutPercentage) {
      return {
        flag,
        enabled: false,
        reason: 'not_rolled_out',
      };
    }
  }
  
  // Check role-based rollout
  if (flag.rolloutTo.length > 0 && !flag.rolloutTo.includes(context.role)) {
    return {
      flag,
      enabled: false,
      reason: 'role_excluded',
    };
  }
  
  return {
    flag,
    enabled: true,
    reason: 'enabled',
  };
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): Record<string, FeatureFlag> {
  return { ...ALL_FEATURE_FLAGS };
}

/**
 * Get a specific feature flag
 */
export function getFeatureFlag(flagId: string): FeatureFlag | undefined {
  return ALL_FEATURE_FLAGS[flagId];
}

/**
 * Enable a feature flag
 */
export function enableFeatureFlag(flagId: string, enabled: boolean = true): void {
  if (ALL_FEATURE_FLAGS[flagId]) {
    ALL_FEATURE_FLAGS[flagId].enabled = enabled;
  }
}

/**
 * Update feature flag configuration
 */
export function updateFeatureFlag(
  flagId: string,
  updates: Partial<Omit<FeatureFlag, 'id' | 'name' | 'description'>>,
): void {
  if (ALL_FEATURE_FLAGS[flagId]) {
    Object.assign(ALL_FEATURE_FLAGS[flagId], updates);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simple hash function for user ID to use with rollout percentages
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if a user is in the rollout for a feature
 */
export function isUserInRollout(
  userId: string,
  rolloutPercentage: number,
): boolean {
  const userHash = hashUserId(userId);
  const rolloutValue = userHash % 100;
  return rolloutValue < rolloutPercentage;
}

// ============================================================================
// FEATURE FLAG CONTEXT
// ============================================================================

/**
 * Create a feature flag context for evaluation
 */
export interface FeatureFlagContext {
  userId: string;
  role: UserRole;
  tenantId?: string;
  environment: string;
}

/**
 * Evaluate all feature flags for a user
 */
export function evaluateAllFeatureFlags(
  context: FeatureFlagContext,
): Record<string, FeatureFlagResult> {
  const results: Record<string, FeatureFlagResult> = {};
  
  for (const [flagId, flag] of Object.entries(ALL_FEATURE_FLAGS)) {
    results[flagId] = isFeatureEnabled(flagId, {
      userId: context.userId as any,
      tenantId: context.tenantId as any,
      role: context.role,
      permissions: new Set(),
      mfaVerified: false,
      isAuthenticated: true,
      isServiceAccount: false,
    });
  }
  
  return results;
}

// ============================================================================
// FEATURE FLAG MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction, Handler } from 'express';
import { AuthorizationContext } from './types';

/**
 * Middleware to attach feature flags to request
 */
export function featureFlagMiddleware(): Handler {
  return (req: Request & { user?: { id: string; tenantId: string; role: string; sessionId: string } }, res: Response, next: NextFunction) => {
    if ((req as any).user) {
      const user = (req as any).user;
      (req as any).featureFlags = evaluateAllFeatureFlags({
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
        environment: process.env.NODE_ENV || 'development',
      });
    }
    
    next();
  };
}

// Import AuthenticatedRequest from middleware to avoid circular dependency issues
type RequestWithUser = Request & {
  user?: {
    id: string;
    tenantId: string;
    role: UserRole;
  };
};

/**
 * Middleware to require a feature flag
 */
export function requireFeatureFlag(flagId: string): Handler {
  return (req: Request & { auth?: AuthorizationContext }, res: Response, next: NextFunction) => {
    const result = isFeatureEnabled(flagId, req.auth);
    
    if (!result.enabled) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: `Feature '${flagId}' is currently disabled`,
          details: {
            reason: result.reason,
            rolloutPercentage: result.flag.rolloutPercentage,
            rolloutTo: result.flag.rolloutTo,
          },
        },
      });
    }
    
    next();
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize feature flags from environment
 * This allows environment variables to override defaults
 */
export function initializeFeatureFlags(): void {
  const config = getFeatureConfig();
  
  // Sync with environment-based config
  if (config) {
    // These are handled by the main config
    // Additional feature flags can be added here
  }
}

// Initialize on import
initializeFeatureFlags();
