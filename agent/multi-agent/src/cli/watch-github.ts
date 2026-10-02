// Watch-GitHub CLI: automation loop connecting the local agent runtime to
// GitHub Actions. Polls for failed workflow runs (and new issues labeled
// "agent"), dispatches fix directives to Michael over UDS, and tracks
// processed items locally so nothing is handled twice.
//
// Env:
//   GH_REPO            owner/name to watch (required)
//   GH_TOKEN           optional token; raises API rate limits (recommended)
//   WATCH_INTERVAL_MS  poll interval (default 120000)
//   WATCH_ISSUES       also watch issues labeled "agent" (default true)
//   WATCH_STATE        processed-item state file (default ~/.local/state/coc/github-watcher.json)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { call } from "../transport/uds.js";
import { Directive, envelope, log } from "../protocol/types.js";

const REPO = process.env.GH_REPO;
const TOKEN = process.env.GH_TOKEN;
const INTERVAL = Number(process.env.WATCH_INTERVAL_MS ?? 120_000);
const WATCH_ISSUES = (process.env.WATCH_ISSUES ?? "true") !== "false";
const STATE_FILE =
  process.env.WATCH_STATE ?? path.join(os.homedir(), ".local/state/coc/github-watcher.json");

const api = async (p: string): Promise<any> => {
  const res = await fetch("https://api.github.com/repos/" + REPO + p, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "coc-agent-watcher",
      ...(TOKEN
        ? { Authorization: "Bearer " + TOKEN, "X-GitHub-Api-Version": "2022-11-28" }
        : {}),
    },
  });
  if (!res.ok) throw new Error("GitHub API " + res.status + " on " + p);
  return res.json();
};

// --- tiny persistent "seen" set -------------------------------------------
const loadSeen = (): Set<string> => {
  try {
    return new Set(JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as string[]);
  } catch {
    return new Set();
  }
};
const saveSeen = (s: Set<string>): void => {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify([...s], null, 2));
};

async function dispatch(directive: Directive, tag: string): Promise<void> {
  log("info", "watcher", "dispatching_directive", { tag });
  try {
    const res = await call(
      envelope("directive", "yhwh", "michael", directive),
      600_000,
    );
    log("info", "watcher", "directive_completed", {
      tag,
      result: JSON.stringify(res?.payload ?? null).slice(0, 800),
    });
  } catch (e) {
    log("error", "watcher", "directive_failed", { tag, error: String(e) });
  }
}

async function pollOnce(seen: Set<string>): Promise<void> {
  // 1. Failed workflow runs
  const runs = await api("/actions/runs?status=failure&per_page=10");
  for (const run of runs.workflow_runs ?? []) {
    const tag = "run:" + run.id;
    if (seen.has(tag)) continue;
    seen.add(tag);
    saveSeen(seen);
    const directive: Directive = {
      text:
        'The GitHub Actions workflow "' + run.name + '" (run #' + run.run_number +
        ") failed on branch " + run.head_branch +
        " for commit " + String(run.head_sha ?? "").slice(0, 7) + " in " + REPO + ". " +
        "Diagnose and fix it. Steps: " +
        "(1) fetch the logs: curl -sL " +
        (TOKEN ? '-H "Authorization: Bearer $GH_TOKEN" ' : "") +
        "https://api.github.com/repos/" + REPO + "/actions/runs/" + run.id +
        "/logs -o /tmp/gh-run-logs.zip && (cd /tmp && rm -rf gh-run-logs && mkdir gh-run-logs && cd gh-run-logs && unzip -o ../gh-run-logs.zip) && grep -rn -i 'error\\|fail' /tmp/gh-run-logs | head -50. " +
        "(2) inspect the repo working copy, find the likely cause, apply a minimal fix. " +
        "(3) verify the fix locally by re-running the failing check as a shell command. " +
        '(4) commit with message "fix(ci): repair ' + run.name + ' run #' + run.run_number + '" and push to origin.',
      context: {
        repo: REPO,
        run: {
          id: run.id,
          name: run.name,
          branch: run.head_branch,
          sha: run.head_sha,
          url: run.html_url,
        },
      },
    };
    await dispatch(directive, tag);
  }

  // 2. Open issues labeled "agent"
  if (WATCH_ISSUES) {
    const issues = await api("/issues?state=open&labels=agent&per_page=10");
    for (const issue of issues ?? []) {
      if (issue.pull_request) continue; // skip PRs
      const tag = "issue:" + issue.number;
      if (seen.has(tag)) continue;
      seen.add(tag);
      saveSeen(seen);
      const directive: Directive = {
        text:
          'GitHub issue #' + issue.number + ' in ' + REPO + ' is labeled "agent": "' + issue.title + '". ' +
          "Steps: " +
          "(1) read the issue: curl -s " +
          (TOKEN ? '-H "Authorization: Bearer $GH_TOKEN" ' : "") +
          "https://api.github.com/repos/" + REPO + "/issues/" + issue.number + ". " +
          "(2) implement the requested change in the repo working copy. " +
          "(3) verify it locally with an appropriate build/test command. " +
          "(4) commit referencing issue #" + issue.number + " and push to origin.",
        context: {
          repo: REPO,
          issue: { number: issue.number, title: issue.title, url: issue.html_url },
        },
      };
      await dispatch(directive, tag);
    }
  }
}

async function main(): Promise<void> {
  if (!REPO) {
    console.error("GH_REPO (owner/name) is required");
    process.exit(1);
  }
  const seen = loadSeen();
  log("info", "watcher", "watch_started", {
    repo: REPO,
    intervalMs: INTERVAL,
    previouslySeen: seen.size,
  });
  // Prime the baseline on first start so we only act on NEW failures.
  let first = true;
  for (;;) {
    try {
      if (first) {
        const runs = await api("/actions/runs?status=failure&per_page=10");
        for (const run of runs.workflow_runs ?? []) seen.add("run:" + run.id);
        if (WATCH_ISSUES) {
          const issues = await api("/issues?state=open&labels=agent&per_page=10");
          for (const i of issues ?? []) if (!i.pull_request) seen.add("issue:" + i.number);
        }
        saveSeen(seen);
        first = false;
        log("info", "watcher", "baseline_primed", { seen: seen.size });
      } else {
        await pollOnce(seen);
      }
    } catch (e) {
      log("warn", "watcher", "poll_failed", { error: String(e) });
    }
    await new Promise((r) => setTimeout(r, INTERVAL));
  }
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
