import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Issue {
  id?: string;
  severity: string;
  confidence?: string;
  category?: string;
  cwe: string;
  owasp?: string;
  lineStart?: number;
  lineEnd?: number;
  evidence?: string;
  exploitScenario?: string;
  testAssertionHint?: string;
  description: string;
  remediation: string;
  status?: string;
}

interface AuditItem {
  path: string;
  blobSha?: string;
  audit: {
    securityScore: number;
    issues: Issue[];
    summary?: string;
  };
  patch?: {
    diffSummary: string;
    diffSnippet: string;
  };
  updatedAt?: string;
}

interface AuditState {
  status: string;
  branch: string;
  commitSha: string;
  runId: string;
  total: number;
  current: number;
  currentFile: string;
  findingsOpen: number;
  findingsVerified: number;
  items: AuditItem[];
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '\x1b[31;1m', // Bold Red
  HIGH: '\x1b[31m',       // Red
  MEDIUM: '\x1b[33m',     // Yellow
  LOW: '\x1b[32m',        // Green
  INFO: '\x1b[36m',       // Cyan
  RESET: '\x1b[0m'
};

async function main() {
  const APPS_SCRIPT_WEB_APP_URL = process.env.APPS_SCRIPT_WEB_APP_URL;

  if (!APPS_SCRIPT_WEB_APP_URL) {
    console.error('❌ Error: Set APPS_SCRIPT_WEB_APP_URL to your deployed Google Apps Script Web App URL.');
    console.error('Example: export APPS_SCRIPT_WEB_APP_URL="https://script.google.com/macros/s/.../exec"');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const shouldApplyPatches = args.includes('--apply');
  const shouldExportJson = args.includes('--json');
  const filterSeverity = args.find(a => a.startsWith('--severity='))?.split('=')[1]?.toUpperCase();

  console.log('📡 Fetching live audit state from Apps Script control plane...');
  const res = await fetch(`${APPS_SCRIPT_WEB_APP_URL}?action=poll`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch audit state: HTTP ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as AuditState;

  console.log(`\n================================================================`);
  console.log(`🔒 Audit Run: \x1b[1m${data.runId || 'N/A'}\x1b[0m [${data.status}]`);
  console.log(`📁 Branch: ${data.branch} (${data.commitSha ? data.commitSha.slice(0, 7) : 'HEAD'})`);
  console.log(`📊 Progress: ${data.current}/${data.total} files scanned`);
  console.log(`🚨 Findings: ${data.findingsOpen} Open · ${data.findingsVerified} Verified`);
  console.log(`================================================================\n`);

  if (shouldExportJson) {
    const reportPath = path.resolve(process.cwd(), `audit-report-${data.runId || 'latest'}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Full audit JSON written to: ${reportPath}\n`);
  }

  const items = data.items || [];
  let totalIssuesCount = 0;

  for (const item of items) {
    const issues = (item.audit?.issues || []).filter(issue => {
      if (!filterSeverity) return true;
      return String(issue.severity).toUpperCase() === filterSeverity;
    });

    if (issues.length === 0) continue;
    totalIssuesCount += issues.length;

    const scoreColor = item.audit.securityScore >= 70 ? '\x1b[32m' : '\x1b[31m';
    console.log(`📄 \x1b[1m${item.path}\x1b[0m — Score: ${scoreColor}${item.audit.securityScore}/100\x1b[0m`);
    
    if (item.audit.summary) {
      console.log(`   \x1b[90m${item.audit.summary}\x1b[0m`);
    }

    for (const issue of issues) {
      const sevColor = SEVERITY_COLORS[issue.severity.toUpperCase()] || SEVERITY_COLORS.RESET;
      const cweText = issue.cwe ? `(${issue.cwe})` : '';
      const owaspText = issue.owasp ? `[${issue.owasp}] ` : '';
      
      console.log(`\n   ${sevColor}[${issue.severity.toUpperCase()}]${SEVERITY_COLORS.RESET} ${owaspText}${cweText} ${issue.description}`);
      
      if (issue.exploitScenario) {
        console.log(`   \x1b[33m⚡ Exploit Vector:\x1b[0m ${issue.exploitScenario}`);
      }
      if (issue.evidence) {
        console.log(`   \x1b[90m📍 Evidence (L${issue.lineStart ?? '?'}-${issue.lineEnd ?? '?'}): ${issue.evidence}\x1b[0m`);
      }
      if (issue.testAssertionHint) {
        console.log(`   \x1b[36m🧪 Suggested Assertion:\x1b[0m ${issue.testAssertionHint}`);
      }
      console.log(`   \x1b[32m💡 Remediation:\x1b[0m ${issue.remediation}`);
    }

    if (item.patch?.diffSnippet) {
      console.log(`\n   \x1b[1mDiff Summary:\x1b[0m ${item.patch.diffSummary}`);

      if (shouldApplyPatches) {
        const patchFile = path.resolve(process.cwd(), `.temp_${path.basename(item.path)}.patch`);
        try {
          fs.writeFileSync(patchFile, item.patch.diffSnippet, 'utf-8');
          execSync(`git apply --whitespace=nowarn "${patchFile}"`, { stdio: 'inherit' });
          console.log(`   \x1b[32m✔ Successfully applied unified diff patch to ${item.path}\x1b[0m`);
        } catch (err: any) {
          console.error(`   \x1b[31m✖ Failed to apply patch automatically to ${item.path}: ${err.message}\x1b[0m`);
        } finally {
          if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
        }
      }
    }

    console.log(`\n----------------------------------------------------------------`);
  }

  if (totalIssuesCount === 0) {
    console.log(`🎉 No matching security findings detected!`);
  }
}

main().catch(err => {
  console.error('\x1b[31mFatal Error:\x1b[0m', err.message || err);
  process.exit(1);
});
