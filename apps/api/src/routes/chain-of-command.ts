/**
 * Chain of Command API Routes
 * 
 * This module provides REST API endpoints for the Chain of Command system.
 * All endpoints are server-only to prevent the browser from authoritatively
 * generating the chain.
 */

import { Router } from 'express';
import { z } from 'zod';
import { SupabaseChainOfCommand, createCaseChain, createResourceChain } from '../lib/chain-of-command-server';
import {
  type ChainEvent,
  type ChainEventType,
  type ChainActorType,
  type ChainResourceType,
  type ChainVerificationResult,
  type ChainTrackingInfo,
  type ChainQueryOptions,
} from '../../../../apps/web/src/lib/chain-of-command';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Get signing secret from environment
const CHAIN_SIGNING_SECRET = process.env.CHAIN_SIGNING_SECRET || 
  'default-signing-secret-32-chars-long-change-in-production';

// ============================================================================
// SCHEMAS
// ============================================================================

// Schema for creating a new chain event
const CreateChainEventSchema = z.object({
  chainId: z.string().optional(),
  type: z.string(),
  actorType: z.string(),
  actorId: z.string(),
  actorName: z.string().optional(),
  resourceType: z.string(),
  resourceId: z.string(),
  resourceName: z.string().optional(),
  caseId: z.string().optional(),
  sessionId: z.string().optional(),
  agentRunId: z.string().optional(),
  evidenceFingerprint: z.string().optional(),
  evidenceId: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});

// Schema for creating a genesis event
const CreateGenesisEventSchema = CreateChainEventSchema.extend({
  chainType: z.string().optional(),
  chainName: z.string().optional(),
  chainDescription: z.string().optional(),
});

// Schema for query options
const ChainQuerySchema = z.object({
  chainId: z.string().optional(),
  caseId: z.string().optional(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  actorId: z.string().optional(),
  actorType: z.string().optional(),
  eventType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Schema for verification options
const VerifyChainSchema = z.object({
  chainId: z.string().optional(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  caseId: z.string().optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

const router = Router();

/**
 * GET /api/chain-of-command/events
 * Get chain events with optional filtering
 */
router.get('/events', async (req, res) => {
  try {
    // Parse query parameters
    const query = ChainQuerySchema.parse(req.query);
    
    // Create chain service
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    // Get events
    const events = await chain.getChainEvents(query as ChainQueryOptions);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error getting chain events:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chain events',
    });
  }
});

/**
 * GET /api/chain-of-command/events/:id
 * Get a specific chain event by ID
 */
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    const event = await chain.getEvent(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Chain event not found',
      });
    }
    
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error getting chain event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chain event',
    });
  }
});

/**
 * POST /api/chain-of-command/events
 * Create a new chain event
 * 
 * This is a server-only endpoint. The browser cannot authoritatively generate the chain.
 */
router.post('/events', async (req, res) => {
  try {
    // Parse request body
    const body = CreateChainEventSchema.parse(req.body);
    
    // Create chain service
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    // Create event
    const event = await chain.createEvent({
      chainId: body.chainId,
      type: body.type as ChainEventType,
      actorType: body.actorType as ChainActorType,
      actorId: body.actorId,
      actorName: body.actorName,
      resourceType: body.resourceType as ChainResourceType,
      resourceId: body.resourceId,
      resourceName: body.resourceName,
      caseId: body.caseId,
      sessionId: body.sessionId,
      agentRunId: body.agentRunId,
      evidenceFingerprint: body.evidenceFingerprint,
      evidenceId: body.evidenceId,
      payload: body.payload || {},
    });
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Chain event created successfully',
    });
  } catch (error) {
    console.error('Error creating chain event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create chain event',
    });
  }
});

/**
 * POST /api/chain-of-command/events/genesis
 * Create a genesis (first) event in a new chain
 */
router.post('/events/genesis', async (req, res) => {
  try {
    const body = CreateGenesisEventSchema.parse(req.body);
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const event = await chain.createGenesisEvent({
      chainId: body.chainId,
      type: body.type as ChainEventType,
      actorType: body.actorType as ChainActorType,
      actorId: body.actorId,
      actorName: body.actorName,
      resourceType: body.resourceType as ChainResourceType,
      resourceId: body.resourceId,
      resourceName: body.resourceName,
      caseId: body.caseId,
      payload: body.payload || {},
      chainType: body.chainType,
      chainName: body.chainName,
      chainDescription: body.chainDescription,
    });
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Genesis chain event created successfully',
    });
  } catch (error) {
    console.error('Error creating genesis event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create genesis event',
    });
  }
});

/**
 * POST /api/chain-of-command/batch
 * Create multiple chain events in a batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { events } = z.object({
      events: z.array(CreateChainEventSchema),
    }).parse(req.body);
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const createdEvents = await Promise.all(
      events.map(event => 
        chain.createEvent({
          chainId: event.chainId,
          type: event.type as ChainEventType,
          actorType: event.actorType as ChainActorType,
          actorId: event.actorId,
          actorName: event.actorName,
          resourceType: event.resourceType as ChainResourceType,
          resourceId: event.resourceId,
          resourceName: event.resourceName,
          caseId: event.caseId,
          sessionId: event.sessionId,
          agentRunId: event.agentRunId,
          evidenceFingerprint: event.evidenceFingerprint,
          evidenceId: event.evidenceId,
          payload: event.payload || {},
        })
      )
    );
    
    res.status(201).json({
      success: true,
      data: createdEvents,
      count: createdEvents.length,
      message: 'Batch chain events created successfully',
    });
  } catch (error) {
    console.error('Error creating batch events:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create batch events',
    });
  }
});

/**
 * GET /api/chain-of-command/chains
 * Get all chains
 */
router.get('/chains', async (req, res) => {
  try {
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    const chains = await chain.getAllChains();
    
    res.json({
      success: true,
      data: chains,
      count: chains.length,
    });
  } catch (error) {
    console.error('Error getting chains:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chains',
    });
  }
});

/**
 * GET /api/chain-of-command/chains/:chainId
 * Get chain metadata by chain ID
 */
router.get('/chains/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    const metadata = await chain.getChainMetadata(chainId);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'Chain metadata not found',
      });
    }
    
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('Error getting chain metadata:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chain metadata',
    });
  }
});

/**
 * GET /api/chain-of-command/chains/:chainId/metadata
 * Get chain metadata (alternative endpoint)
 */
router.get('/chains/:chainId/metadata', async (req, res) => {
  try {
    const { chainId } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    const metadata = await chain.getChainMetadata(chainId);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'Chain metadata not found',
      });
    }
    
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('Error getting chain metadata:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chain metadata',
    });
  }
});

/**
 * POST /api/chain-of-command/verify
 * Verify a chain for integrity
 */
router.post('/verify', async (req, res) => {
  try {
    const body = VerifyChainSchema.parse(req.body);
    const requestedBy = req.user?.id || 'anonymous';
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const result = await chain.verifyChain({
      chainId: body.chainId,
      resourceId: body.resourceId,
      resourceType: body.resourceType as ChainResourceType,
      caseId: body.caseId,
      requestedBy,
      logResult: true,
    });
    
    res.json({
      success: true,
      data: result,
      valid: result.valid,
    });
  } catch (error) {
    console.error('Error verifying chain:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify chain',
    });
  }
});

/**
 * GET /api/chain-of-command/verify/:chainId
 * Verify a specific chain by ID
 */
router.get('/verify/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    const requestedBy = req.user?.id || 'anonymous';
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const result = await chain.verifyChain({
      chainId,
      requestedBy,
      logResult: true,
    });
    
    res.json({
      success: true,
      data: result,
      valid: result.valid,
    });
  } catch (error) {
    console.error('Error verifying chain:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify chain',
    });
  }
});

/**
 * GET /api/chain-of-command/tracking/:resourceType/:resourceId
 * Get tracking information for a resource (FedEx-style UI data)
 */
router.get('/tracking/:resourceType/:resourceId', async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const trackingInfo = await chain.getTrackingInfo(
      resourceType as ChainResourceType,
      resourceId
    );
    
    if (!trackingInfo) {
      return res.status(404).json({
        success: false,
        error: 'Tracking information not found',
      });
    }
    
    res.json({
      success: true,
      data: trackingInfo,
    });
  } catch (error) {
    console.error('Error getting tracking info:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tracking info',
    });
  }
});

/**
 * GET /api/chain-of-command/case/:caseId/tracking
 * Get tracking information for all chains in a case
 */
router.get('/case/:caseId/tracking', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const trackingInfos = await chain.getCaseTrackingInfo(caseId);
    
    res.json({
      success: true,
      data: trackingInfos,
      count: trackingInfos.length,
    });
  } catch (error) {
    console.error('Error getting case tracking info:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get case tracking info',
    });
  }
});

/**
 * GET /api/chain-of-command/latest/:chainId
 * Get the latest event in a chain
 */
router.get('/latest/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    const event = await chain.getLatestEvent(chainId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'No events found in chain',
      });
    }
    
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error getting latest event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get latest event',
    });
  }
});

/**
 * GET /api/chain-of-command/genesis/:chainId
 * Get the genesis event in a chain
 */
router.get('/genesis/:chainId', async (req, res) => {
  try {
    const { chainId } = req.params;
    
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    const event = await chain.getGenesisEvent(chainId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'No genesis event found in chain',
      });
    }
    
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error getting genesis event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get genesis event',
    });
  }
});

/**
 * GET /api/chain-of-command/stats
 * Get chain statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const chain = new SupabaseChainOfCommand({ signingSecret: CHAIN_SIGNING_SECRET });
    
    const allChains = await chain.getAllChains();
    const totalEvents = allChains.reduce((sum, chain) => sum + (chain.totalEvents || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalChains: allChains.length,
        totalEvents,
        verifiedChains: allChains.filter(c => c.verificationStatus === 'verified').length,
        tamperedChains: allChains.filter(c => c.verificationStatus === 'tampered').length,
        incompleteChains: allChains.filter(c => c.verificationStatus === 'incomplete').length,
      },
    });
  } catch (error) {
    console.error('Error getting chain stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chain stats',
    });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
