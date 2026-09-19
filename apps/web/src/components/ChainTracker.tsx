/**
 * ChainTracker - FedEx-style Tracking UI Component
 * 
 * This component provides a visual tracking interface for the Chain of Command system.
 * Users can follow an evidence/document/action from origin through every handoff
 * and verify the chain integrity with a VERIFY CHAIN button.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Unlink, 
  Hash, 
  Clock, 
  User, 
  FileText, 
  Package, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreVertical,
  Copy
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type ChainEvent,
  type ChainEventType,
  type ChainTrackingInfo,
  type ChainTrackingEvent,
  type ChainVerificationResult,
  type ChainResourceType,
  ChainOfCommand
} from '@/lib/chain-of-command';

// ============================================================================
// TYPES
// ============================================================================

interface ChainTrackerProps {
  chainId?: string;
  resourceId?: string;
  resourceType?: string;
  caseId?: string;
  onVerify?: (result: ChainVerificationResult) => void;
  onEventSelect?: (event: ChainTrackingEvent) => void;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_COLORS = {
  verified: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: ShieldCheck,
    label: 'Verified',
  },
  unverified: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: ShieldAlert,
    label: 'Unverified',
  },
  tampered: {
    bg: 'bg-red-950/40',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: ShieldX,
    label: 'Tampered',
  },
  incomplete: {
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    icon: Unlink,
    label: 'Incomplete',
  },
} as const;

const EVENT_ICONS: Record<ChainEventType, React.ElementType> = {
  // Document lifecycle
  'document.uploaded': FileText,
  'document.accessed': FileText,
  'document.extracted': FileText,
  'document.analyzed': FileText,
  'document.exported': FileText,
  'document.modified': FileText,
  'document.deleted': FileText,
  
  // Case lifecycle
  'case.created': Package,
  'case.accessed': Package,
  'case.modified': Package,
  'case.closed': Package,
  'case.reopened': Package,
  
  // AI/Agent events
  'ai.model_request': User,
  'ai.model_response': User,
  'ai.tool_call': User,
  'ai.tool_result': User,
  'ai.citation_verified': CheckCircle2,
  'ai.citation_unverifiable': XCircle,
  'ai.injection_detected': ShieldAlert,
  
  // Filing events
  'filing.created': FileText,
  'filing.submitted': FileText,
  'filing.accepted': CheckCircle2,
  'filing.rejected': XCircle,
  'filing.appealed': FileText,
  
  // Security/Compliance events
  'security.permission_check': ShieldCheck,
  'security.permission_denied': ShieldX,
  'security.scope_escalation_attempt': ShieldAlert,
  'security.external_action_authorized': CheckCircle2,
  'security.external_action_blocked': ShieldX,
  'security.audit_exported': FileText,
  
  // Evidence events
  'evidence.uploaded': FileText,
  'evidence.processed': FileText,
  'evidence.verified': CheckCircle2,
  'evidence.challenged': AlertCircle,
  'evidence.linked': Unlink,
  
  // System events
  'system.backup_created': Package,
  'system.restore_performed': Package,
  'system.migration_applied': Package,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

function formatDateShort(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString();
}

function formatTimeShort(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function shortenHash(hash: string | null, length: number = 8): string {
  if (!hash) return 'N/A';
  return `${hash.substring(0, length)}...`;
}

function getStatusConfig(status: string) {
  const defaultStatus = STATUS_COLORS.unverified;
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || defaultStatus;
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge 
      className={`flex items-center gap-1.5 px-2 py-1 ${config.bg} ${config.border} ${config.text} ${className}`}
      variant="outline"
    >
      <Icon size={12} />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{config.label}</span>
    </Badge>
  );
}

interface TimelineEventProps {
  event: ChainTrackingEvent;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  verificationResult: ChainVerificationResult;
}

function TimelineEvent({ 
  event, 
  index, 
  isExpanded, 
  onToggle,
  isLast,
  verificationResult 
}: TimelineEventProps) {
  const Icon = EVENT_ICONS[event.type] || FileText;
  const statusConfig = getStatusConfig(verificationResult.valid ? 'verified' : 'tampered');
  
  // Check if this event has errors
  const hasError = verificationResult.errors.some(e => e.eventId === event.hash);
  
  return (
    <div className="relative pl-8 last:pb-0">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-3.5 top-4 bottom-0 w-0.5 bg-white/10" />
      )}
      
      <div className="relative flex gap-4">
        {/* Event icon and sequence */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`
            flex items-center justify-center w-7 h-7 rounded-full border-2 
            ${hasError 
              ? 'bg-red-950/60 border-red-500/40' 
              : 'bg-white/5 border-white/20'
            }
            transition-colors
          `}>
            <Icon size={16} className={hasError ? 'text-red-400' : 'text-white/70'} />
          </div>
          <span className="text-[9px] text-white/40 font-mono mt-1">{index + 1}</span>
        </div>
        
        {/* Event content */}
        <div className="flex-1 py-3 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-white/90 truncate">{event.description}</h4>
                {hasError && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                          <AlertCircle size={12} className="text-red-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-red-950 border-red-700 text-red-100">
                        <p className="text-xs">Verification error detected</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono">
                <span>{formatDateShort(event.timestamp)}</span>
                <span className="text-white/30">|</span>
                <span>{formatTimeShort(event.timestamp)}</span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1">
                  <User size={10} className="text-white/40" />
                  {event.actorName || event.actorType}
                </span>
              </div>
              
              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-4 bg-black/40 p-3 rounded-lg border border-white/10">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">
                        Sequence
                      </span>
                      <span className="text-white/80 font-mono">{event.sequenceNumber}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">
                        Type
                      </span>
                      <span className="text-white/80 font-mono text-xs">{event.type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">
                        Hash
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#D4AF37] font-mono">{shortenHash(event.hash, 16)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-white/40 hover:text-[#D4AF37] hover:bg-white/5"
                          onClick={() => navigator.clipboard.writeText(event.hash)}
                        >
                          <Copy size={10} />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">
                        Previous Hash
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-mono">{shortenHash(event.previousHash, 16)}</span>
                        {event.previousHash && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-white/40 hover:text-[#D4AF37] hover:bg-white/5"
                            onClick={() => {
                              if (event.previousHash) void navigator.clipboard.writeText(event.previousHash);
                            }}
                          >
                            <Copy size={10} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Expand/collapse button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-white/40 hover:text-[#D4AF37] hover:bg-white/5"
              onClick={onToggle}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VerificationSummaryProps {
  result: ChainVerificationResult;
  className?: string;
}

function VerificationSummary({ result, className = '' }: VerificationSummaryProps) {
  const statusConfig = getStatusConfig(
    result.valid ? 'verified' : 
    result.hasTamperedHashes ? 'tampered' :
    result.hasBrokenLinks || result.hasSequenceGaps ? 'incomplete' : 'unverified'
  );
  
  const progress = (result.verifiedEvents / Math.max(result.totalEvents, 1)) * 100;
  
  return (
    <Card className={`border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${statusConfig.bg} ${statusConfig.border}`}>
              <statusConfig.icon size={20} className={statusConfig.text} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white">
                Chain Verification Status
              </CardTitle>
              <CardDescription className="text-xs text-white/50">
                {result.totalEvents} events • {result.verifiedEvents} verified
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={result.valid ? 'verified' : 'tampered'} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-white/50 mb-1">
            <span>Verified</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className={`h-2 ${
              result.valid ? 'bg-emerald-500' : 
              result.hasTamperedHashes ? 'bg-red-500' : 
              'bg-amber-500'
            }`}
          />
        </div>
        
        {/* Error summary */}
        {!result.valid && (
          <div className="space-y-2 text-xs">
            {result.hasTamperedHashes && (
              <Alert className="bg-red-950/40 border-red-700/40 text-red-300 p-2">
                <ShieldX size={14} className="shrink-0" />
                <AlertTitle className="font-semibold text-[10px] mb-0">Tampered Hashes</AlertTitle>
                <AlertDescription className="text-[10px]">
                  {result.errors.filter(e => e.type === 'tampered_hash').length} events have modified hashes
                </AlertDescription>
              </Alert>
            )}
            
            {result.hasBrokenLinks && (
              <Alert className="bg-orange-950/40 border-orange-700/40 text-orange-300 p-2">
                <Unlink size={14} className="shrink-0" />
                <AlertTitle className="font-semibold text-[10px] mb-0">Broken Links</AlertTitle>
                <AlertDescription className="text-[10px]">
                  {result.errors.filter(e => e.type === 'broken_link').length} events have broken chain links
                </AlertDescription>
              </Alert>
            )}
            
            {result.hasSequenceGaps && (
              <Alert className="bg-amber-950/40 border-amber-700/40 text-amber-300 p-2">
                <AlertCircle size={14} className="shrink-0" />
                <AlertTitle className="font-semibold text-[10px] mb-0">Sequence Gaps</AlertTitle>
                <AlertDescription className="text-[10px]">
                  {result.errors.filter(e => e.type === 'sequence_gap').length} sequence gaps detected
                </AlertDescription>
              </Alert>
            )}
            
            {result.hasInvalidSignatures && (
              <Alert className="bg-purple-950/40 border-purple-700/40 text-purple-300 p-2">
                <ShieldAlert size={14} className="shrink-0" />
                <AlertTitle className="font-semibold text-[10px] mb-0">Invalid Signatures</AlertTitle>
                <AlertDescription className="text-[10px]">
                  {result.errors.filter(e => e.type === 'invalid_signature').length} events have invalid signatures
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{result.totalEvents}</div>
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-emerald-400">{result.verifiedEvents}</div>
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{result.errors.length}</div>
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-white/80 truncate">{shortenHash(result.latestHash, 6)}</div>
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Latest Hash</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChainHeaderProps {
  trackingInfo: ChainTrackingInfo;
  onVerify: () => void;
  isVerifying: boolean;
}

function ChainHeader({ trackingInfo, onVerify, isVerifying }: ChainHeaderProps) {
  const statusConfig = getStatusConfig(trackingInfo.status);
  
  return (
    <CardHeader className="pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <Package size={24} className="text-[#D4AF37]" />
            <span className="truncate">{trackingInfo.resourceName}</span>
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-white/60">
            <span className="text-[#D4AF37] font-mono">{trackingInfo.resourceType}</span>
            <span className="text-white/40 mx-2">|</span>
            <span>{trackingInfo.totalEvents} events in chain</span>
            {trackingInfo.caseId && (
              <>
                <span className="text-white/40 mx-2">|</span>
                <span className="text-white/80">Case: {trackingInfo.caseId}</span>
              </>
            )}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={trackingInfo.status} />
          <Button
            onClick={onVerify}
            disabled={isVerifying}
            className="gap-2 bg-[#174E48] hover:bg-[#1f665e] text-[#D4AF37] font-semibold shadow-lg"
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                VERIFY CHAIN
              </>
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ChainTracker - FedEx-style tracking UI for Chain of Command
 */
export function ChainTracker({
  chainId,
  resourceId,
  resourceType,
  caseId,
  onVerify: externalOnVerify,
  onEventSelect,
  className = '',
}: ChainTrackerProps) {
  const [trackingInfo, setTrackingInfo] = useState<ChainTrackingInfo | null>(null);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for demonstration (in production, this would come from API)
  const [mockChain, setMockChain] = useState<ChainOfCommand | null>(null);
  
  // Initialize mock chain for demo
  useEffect(() => {
    // Create a mock chain for demonstration
    const chain = new ChainOfCommand({
      signingSecret: 'demo-signing-secret-32-chars-long!',
      chainId: chainId || 'demo-chain-001',
    });
    setMockChain(chain);
    
    // Create mock tracking info
    const mockTrackingInfo: ChainTrackingInfo = {
      resourceId: resourceId || 'doc-001',
      resourceType: (resourceType as ChainResourceType) || 'document',
      resourceName: 'Exhibit_A_Dashcam_Log.pdf',
      caseId: caseId || 'case-001',
      chainId: chainId || 'demo-chain-001',
      totalEvents: 0,
      timeline: [],
      status: 'verified',
      verificationResult: {
        valid: true,
        chainId: chainId || 'demo-chain-001',
        totalEvents: 0,
        verifiedEvents: 0,
        errors: [],
        hasTamperedHashes: false,
        hasBrokenLinks: false,
        hasSequenceGaps: false,
        hasInvalidSignatures: false,
        genesisEventId: null,
        genesisTimestamp: null,
        latestEventId: null,
        latestTimestamp: null,
        latestHash: null,
      },
    };
    setTrackingInfo(mockTrackingInfo);
    setVerificationResult(mockTrackingInfo.verificationResult);
    
    // Generate mock events
    generateMockEvents(chain);
  }, []);
  
  // Generate mock events for demonstration
  const generateMockEvents = async (chain: ChainOfCommand) => {
    // Create genesis event
    await chain.createGenesisEvent({
      type: 'document.uploaded',
      actorType: 'user',
      actorId: 'user-alex-123',
      actorName: 'Alex Thompson',
      resourceType: 'document',
      resourceId: resourceId || 'doc-001',
      resourceName: 'Exhibit_A_Dashcam_Log.pdf',
      caseId: caseId || 'case-001',
      payload: {
        fileSize: '2.4 MB',
        mimeType: 'application/pdf',
      },
    });
    
    // Add more events
    await chain.createEvent({
      type: 'evidence.verified',
      actorType: 'system',
      actorId: 'system-verification',
      actorName: 'System Verification',
      resourceType: 'document',
      resourceId: resourceId || 'doc-001',
      resourceName: 'Exhibit_A_Dashcam_Log.pdf',
      caseId: caseId || 'case-001',
      payload: {
        verificationMethod: 'SHA-256',
        result: 'valid',
      },
    });
    
    await chain.createEvent({
      type: 'ai.model_request',
      actorType: 'agent',
      actorId: 'agent-legal-research',
      actorName: 'Legal Research Agent',
      resourceType: 'document',
      resourceId: resourceId || 'doc-001',
      resourceName: 'Exhibit_A_Dashcam_Log.pdf',
      caseId: caseId || 'case-001',
      agentRunId: 'run-001',
      payload: {
        model: 'gpt-4',
        prompt: 'Analyze dashcam log for traffic violations',
      },
    });
    
    await chain.createEvent({
      type: 'ai.citation_verified',
      actorType: 'agent',
      actorId: 'agent-legal-research',
      actorName: 'Legal Research Agent',
      resourceType: 'document',
      resourceId: resourceId || 'doc-001',
      resourceName: 'Exhibit_A_Dashcam_Log.pdf',
      caseId: caseId || 'case-001',
      agentRunId: 'run-001',
      payload: {
        citation: 'Ind. Code § 9-21-8-49',
        source: 'https://iga.in.gov/legislative/codes/ic#9/21/8/49',
      },
    });
    
    await chain.createEvent({
      type: 'security.permission_check',
      actorType: 'user',
      actorId: 'user-judge-smith',
      actorName: 'Judge Smith',
      resourceType: 'document',
      resourceId: resourceId || 'doc-001',
      resourceName: 'Exhibit_A_Dashcam_Log.pdf',
      caseId: caseId || 'case-001',
      payload: {
        action: 'access',
        result: 'granted',
      },
    });
    
    // Get updated tracking info
    const trackingInfo = await chain.getTrackingInfo('document', resourceId || 'doc-001');
    const verificationResult = await chain.verifyChain();
    
    if (trackingInfo) {
      setTrackingInfo(trackingInfo);
      setVerificationResult(verificationResult);
    }
  };
  
  // Handle verify button click
  const handleVerify = useCallback(async () => {
    if (!mockChain) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      const result = await mockChain.verifyChain();
      setVerificationResult(result);
      
      // Update tracking info with new verification result
      if (trackingInfo) {
        setTrackingInfo({
          ...trackingInfo,
          verificationResult: result,
          status: result.valid ? 'verified' : 
            result.hasTamperedHashes ? 'tampered' :
            result.hasBrokenLinks || result.hasSequenceGaps ? 'incomplete' : 'unverified',
        });
      }
      
      // Call external handler if provided
      if (externalOnVerify) {
        externalOnVerify(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [mockChain, trackingInfo, externalOnVerify]);
  
  // Toggle event expansion
  const toggleEvent = useCallback((eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);
  
  // Handle event selection
  const handleEventSelect = useCallback((event: ChainTrackingEvent) => {
    if (onEventSelect) {
      onEventSelect(event);
    }
  }, [onEventSelect]);
  
  if (!trackingInfo) {
    return (
      <Card className={`border-white/10 ${className}`}>
        <CardContent className="p-8 text-center">
          <Package size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/60">Loading chain tracking information...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <Card className={`border-white/10 bg-black/60 backdrop-blur-xl ${className}`}>
        {/* Header */}
        <ChainHeader 
          trackingInfo={trackingInfo} 
          onVerify={handleVerify} 
          isVerifying={isVerifying} 
        />
        
        {/* Verification Summary */}
        {verificationResult && (
          <div className="px-6 pb-4">
            <VerificationSummary result={verificationResult} />
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <Alert className="mx-6 mb-4 bg-red-950/40 border-red-700/40 text-red-300">
            <AlertCircle size={16} className="shrink-0" />
            <AlertTitle className="font-semibold">Verification Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Timeline */}
        <CardContent className="pt-0">
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-[11px] font-bold tracking-widest text-white/50 uppercase mb-4 px-1">
              Chain Timeline
            </h3>
            
            {trackingInfo.timeline.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Clock size={32} className="mx-auto mb-2" />
                <p>No events in this chain yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {trackingInfo.timeline.map((event, index) => (
                  <TimelineEvent
                    key={event.hash || index}
                    event={event}
                    index={index}
                    isExpanded={expandedEvents.has(event.hash)}
                    onToggle={() => toggleEvent(event.hash)}
                    isLast={index === trackingInfo.timeline.length - 1}
                    verificationResult={verificationResult || trackingInfo.verificationResult}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Footer with stats */}
        {trackingInfo.timeline.length > 0 && (
          <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between text-[10px] text-white/50">
            <span>
              Genesis: {formatDate(trackingInfo.verificationResult.genesisTimestamp || '')}
            </span>
            <span>
              Latest: {formatDate(trackingInfo.verificationResult.latestTimestamp || '')}
            </span>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}

// ============================================================================
// CHAIN TRACKER LIST (for multiple chains)
// ============================================================================

interface ChainTrackerListProps {
  chains: ChainTrackingInfo[];
  onChainSelect?: (chain: ChainTrackingInfo) => void;
  className?: string;
}

export function ChainTrackerList({ chains, onChainSelect, className = '' }: ChainTrackerListProps) {
  if (chains.length === 0) {
    return (
      <Card className={`border-white/10 ${className}`}>
        <CardContent className="p-8 text-center">
          <Package size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/60">No chains found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {chains.map(chain => (
        <Card
          key={chain.chainId}
          className="border-white/10 bg-black/60 backdrop-blur-xl cursor-pointer hover:border-[#D4AF37]/30 transition-colors"
          onClick={() => onChainSelect?.(chain)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <Package size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white truncate">
                    {chain.resourceName}
                  </CardTitle>
                  <CardDescription className="text-xs text-white/50">
                    {chain.resourceType} • {chain.totalEvents} events
                  </CardDescription>
                </div>
              </div>
              <StatusBadge status={chain.status} />
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>Chain: {shortenHash(chain.chainId, 12)}</span>
              {chain.caseId && <span>Case: {chain.caseId}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// CHAIN VERIFICATION BUTTON (standalone)
// ============================================================================

interface VerifyChainButtonProps {
  chainId: string;
  onVerify: (result: ChainVerificationResult) => void;
  className?: string;
}

export function VerifyChainButton({ chainId, onVerify, className = '' }: VerifyChainButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<ChainVerificationResult | null>(null);
  
  const handleVerify = async () => {
    setIsVerifying(true);
    
    try {
      // In production, this would call the API
      // For now, we'll simulate a verification
      const mockResult: ChainVerificationResult = {
        valid: true,
        chainId,
        totalEvents: 5,
        verifiedEvents: 5,
        errors: [],
        hasTamperedHashes: false,
        hasBrokenLinks: false,
        hasSequenceGaps: false,
        hasInvalidSignatures: false,
        genesisEventId: 'event-1',
        genesisTimestamp: new Date().toISOString(),
        latestEventId: 'event-5',
        latestTimestamp: new Date().toISOString(),
        latestHash: 'abc123...',
      };
      
      setLastResult(mockResult);
      onVerify(mockResult);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <Button
      onClick={handleVerify}
      disabled={isVerifying}
      className={`gap-2 ${className}`}
    >
      {isVerifying ? (
        <>
          <RefreshCw size={16} className="animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <ShieldCheck size={16} />
          VERIFY CHAIN
        </>
      )}
    </Button>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ChainTracker,
  ChainTrackerList,
  VerifyChainButton,
  StatusBadge,
  getStatusConfig,
  formatDate,
  formatDateShort,
  formatTimeShort,
  shortenHash,
};
