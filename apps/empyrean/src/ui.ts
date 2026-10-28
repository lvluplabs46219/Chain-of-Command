// Telegram Web UI for Empyrean GenTeam Autonomous Multi-Agent Workspace
export function renderDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Empyrean GenTeam — Autonomous Multi-Agent Workspace</title>
  <meta name="description" content="GenTeam multi-agent collaborative operations environment combined with Telegram UX: persistent channels, digital employees, execution canvases, and shared context.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --tg-bg: #0e1621;
      --tg-surface: #17212b;
      --tg-surface-hover: #202b36;
      --tg-surface-active: #2b5278;
      --tg-primary: #5288c1;
      --tg-primary-hover: #659dd8;
      --tg-accent-blue: #2481cc;
      --tg-border: rgba(255, 255, 255, 0.08);
      --tg-border-light: rgba(255, 255, 255, 0.12);
      --tg-text: #f5f5f5;
      --tg-text-muted: #7f91a4;
      --tg-text-dim: #5c6c7f;
      --tg-msg-in: #182533;
      --tg-msg-out: #2b5278;
      --tg-online: #4fae4e;
      --tg-check: #4fae4e;
      --tg-warn: #f59e0b;
      --tg-danger: #ef4444;
      --tg-purple: #a855f7;
      --tg-cyan: #06b6d4;
      --font-tg: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--tg-bg);
      color: var(--tg-text);
      font-family: var(--font-tg);
      height: 100vh;
      overflow: hidden;
      display: flex;
      font-size: 13.5px;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.28); }

    /* Left Sidebar: Telegram Navigation */
    .tg-sidebar {
      width: 330px;
      min-width: 330px;
      background: var(--tg-surface);
      border-right: 1px solid var(--tg-border);
      display: flex;
      flex-direction: column;
      height: 100vh;
      z-index: 30;
      user-select: none;
    }
    .tg-sidebar-header {
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--tg-border);
      position: relative;
    }
    .tg-menu-btn {
      background: transparent;
      border: none;
      color: var(--tg-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 7px;
      border-radius: 50%;
      transition: background 0.15s, color 0.15s;
    }
    .tg-menu-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
    
    .tg-search-bar {
      flex: 1;
      background: #242f3d;
      border-radius: 20px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .tg-search-bar:hover { background: #2c3848; }
    .tg-search-bar input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 13px;
      width: 100%;
      cursor: pointer;
    }
    .tg-search-shortcut {
      font-size: 10px;
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 5px;
      border-radius: 4px;
      color: var(--tg-text-muted);
    }

    /* Telegram Folder Tabs */
    .tg-tabs-bar {
      display: flex;
      background: var(--tg-surface);
      border-bottom: 1px solid var(--tg-border);
      padding: 0 8px;
      overflow-x: auto;
    }
    .tg-tab-btn {
      background: transparent;
      border: none;
      color: var(--tg-text-muted);
      font-size: 12.5px;
      font-weight: 500;
      padding: 10px 12px;
      cursor: pointer;
      position: relative;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: color 0.15s;
    }
    .tg-tab-btn:hover { color: #fff; }
    .tg-tab-btn.active { color: var(--tg-primary); }
    .tg-tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 2.5px;
      background: var(--tg-primary);
      border-radius: 2px 2px 0 0;
    }
    .tg-tab-badge {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 10px;
      font-weight: 700;
    }
    .tg-tab-btn.active .tg-tab-badge { background: var(--tg-primary); }

    .sidebar-category {
      padding: 12px 14px 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tg-text-dim);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-action-link {
      color: var(--tg-primary);
      font-size: 11px;
      cursor: pointer;
      text-transform: none;
      font-weight: normal;
    }
    .sidebar-action-link:hover { text-decoration: underline; }

    .tg-chat-list {
      flex: 1;
      overflow-y: auto;
      list-style: none;
    }
    .tg-chat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      cursor: pointer;
      transition: background 0.15s ease;
      position: relative;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    }
    .tg-chat-item:hover { background: var(--tg-surface-hover); }
    .tg-chat-item.active { background: #202b36; border-left: 3px solid var(--tg-primary); }
    .tg-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #fff;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }
    .tg-online-badge {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--tg-online);
      position: absolute;
      bottom: 0;
      right: 0;
      border: 2px solid var(--tg-surface);
    }
    .tg-online-badge.cloud { background: var(--tg-purple); }
    .tg-chat-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tg-chat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tg-chat-name {
      font-weight: 500;
      font-size: 13.5px;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tg-chat-time {
      font-size: 11px;
      color: var(--tg-text-muted);
    }
    .tg-chat-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .tg-chat-preview {
      font-size: 12px;
      color: var(--tg-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .tg-unread-badge {
      background: var(--tg-primary);
      color: #fff;
      font-size: 10.5px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }
    .tg-pin-icon { color: var(--tg-text-dim); font-size: 11px; }

    /* Sidebar Footer */
    .tg-sidebar-footer {
      padding: 10px 14px;
      border-top: 1px solid var(--tg-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.2);
      font-size: 11.5px;
    }
    .user-pill { display: flex; align-items: center; gap: 8px; }
    .user-avatar-sm {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #334155;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
    }

    /* Main Container with Split Screen support */
    .tg-workspace-container {
      flex: 1;
      display: flex;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    /* Main Chat Viewport */
    .tg-main {
      flex: 1;
      min-width: 360px;
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #0e1621;
      position: relative;
      transition: flex 0.2s ease;
    }

    /* Top Chat Header */
    .tg-header {
      background: var(--tg-surface);
      border-bottom: 1px solid var(--tg-border);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 58px;
      z-index: 10;
    }
    .tg-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    .tg-header-details { display: flex; flex-direction: column; }
    .tg-header-title {
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tg-header-subtitle { font-size: 12px; color: var(--tg-text-muted); }
    .tg-header-tools { display: flex; align-items: center; gap: 6px; }
    .tg-tool-btn {
      background: #242f3d;
      border: 1px solid var(--tg-border);
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 11px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s, border-color 0.15s;
    }
    .tg-tool-btn:hover { background: #2c3848; border-color: rgba(255, 255, 255, 0.2); }
    .tg-tool-btn.active {
      background: var(--tg-surface-active);
      border-color: var(--tg-primary);
    }

    /* Pinned Message Ribbon */
    .tg-pinned-ribbon {
      background: #17212b;
      border-bottom: 1px solid var(--tg-border);
      padding: 6px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      cursor: pointer;
      z-index: 9;
      transition: background 0.15s;
    }
    .tg-pinned-ribbon:hover { background: #1c2834; }
    .tg-pinned-left {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .tg-pinned-title { font-weight: 700; color: var(--tg-primary); }
    .tg-pinned-text { color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; }

    /* Chat Messages Stream */
    .tg-messages-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: radial-gradient(circle at 50% 50%, #111a24 0%, #0e1621 100%);
    }

    .tg-date-divider {
      align-self: center;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(4px);
      padding: 4px 14px;
      border-radius: 12px;
      font-size: 11px;
      color: var(--tg-text-muted);
      font-weight: 500;
      margin: 6px 0;
    }

    /* Message Bubbles */
    .tg-msg-wrapper {
      display: flex;
      gap: 10px;
      max-width: 82%;
      align-self: flex-start;
      position: relative;
    }
    .tg-msg-wrapper.outgoing {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .tg-msg-bubble {
      padding: 8px 12px 6px 12px;
      border-radius: 12px 12px 12px 2px;
      background: var(--tg-msg-in);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 140px;
    }
    .tg-msg-wrapper.outgoing .tg-msg-bubble {
      background: var(--tg-msg-out);
      border-radius: 12px 12px 2px 12px;
    }
    .tg-msg-sender {
      font-weight: 700;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .tg-role-tag {
      font-size: 9.5px;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      font-weight: normal;
    }
    .tg-msg-text {
      font-size: 13.5px;
      line-height: 1.48;
      color: #fff;
      word-break: break-word;
    }

    /* Live Activity & Task Tracker Monitoring */
    .tg-activity-card {
      background: #0e1621;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 3px solid var(--tg-primary);
      border-radius: 6px;
      padding: 9px 12px;
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tg-activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
    }
    .tg-activity-title {
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tg-step-tracker {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .tg-step-pill {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 10px;
      background: #242f3d;
      color: var(--tg-text-muted);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tg-step-pill.completed {
      background: rgba(79, 174, 78, 0.15);
      color: var(--tg-online);
      border: 1px solid rgba(79, 174, 78, 0.3);
    }
    .tg-step-pill.running {
      background: rgba(82, 136, 193, 0.2);
      color: var(--tg-primary);
      border: 1px solid var(--tg-primary);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* Specialized Execution Canvas Attachment Pill */
    .tg-canvas-card {
      background: #242f3d;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      margin-top: 5px;
      transition: background 0.15s, transform 0.1s;
    }
    .tg-canvas-card:hover {
      background: #2e3b4d;
      transform: translateY(-1px);
    }
    .tg-canvas-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-size: 12.5px;
      font-weight: 500;
    }
    .tg-canvas-btn {
      font-size: 11.5px;
      color: var(--tg-primary);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Inline Action Buttons (Telegram Keyboard) */
    .tg-inline-keyboard {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .tg-inline-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 11.5px;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .tg-inline-btn:hover { background: rgba(255, 255, 255, 0.16); }

    /* Code Blocks */
    .tg-code-block {
      background: #0e1621;
      border: 1px solid var(--tg-border);
      border-radius: 6px;
      padding: 10px 12px;
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: #a5b4fc;
      overflow-x: auto;
      margin: 4px 0;
      line-height: 1.4;
      white-space: pre;
    }

    /* Voice Note Player (Telegram Audio Message) */
    .tg-voice-player {
      background: #17212b;
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
    }
    .tg-voice-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--tg-primary);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .tg-voice-waveform {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 2px;
      height: 24px;
    }
    .wave-stick {
      width: 3px;
      background: var(--tg-primary);
      border-radius: 2px;
      transition: height 0.2s;
    }
    .tg-voice-duration {
      font-size: 11px;
      color: var(--tg-text-muted);
      font-family: var(--font-mono);
    }

    /* Footer of Bubble */
    .tg-msg-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      font-size: 10.5px;
      color: var(--tg-text-muted);
      margin-top: 2px;
    }
    .tg-checkmarks {
      color: var(--tg-check);
      font-size: 12px;
    }

    /* Input Bar */
    .tg-input-bar {
      background: var(--tg-surface);
      border-top: 1px solid var(--tg-border);
      padding: 10px 16px;
      display: flex;
      align-items: flex-end;
      gap: 10px;
      position: relative;
    }
    .tg-input-icon {
      background: transparent;
      border: none;
      color: var(--tg-text-muted);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s, background 0.15s;
    }
    .tg-input-icon:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }

    .tg-input-wrapper {
      flex: 1;
      background: #242f3d;
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
    }
    .tg-active-contexts-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tg-context-pill {
      background: #17212b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      color: #93c5fd;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tg-context-remove {
      cursor: pointer;
      color: var(--tg-text-muted);
    }
    .tg-context-remove:hover { color: #fff; }

    .tg-text-input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 13.5px;
      font-family: var(--font-tg);
      resize: none;
      max-height: 120px;
      width: 100%;
      line-height: 1.4;
    }

    .tg-send-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--tg-primary);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }
    .tg-send-btn:hover { background: var(--tg-primary-hover); transform: scale(1.05); }
    .tg-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Typing Indicator */
    .tg-typing-indicator {
      font-size: 11.5px;
      color: var(--tg-primary);
      padding: 4px 20px;
      background: rgba(23, 33, 43, 0.95);
      border-bottom: 1px solid var(--tg-border);
      display: none;
      align-items: center;
      gap: 8px;
    }

    /* Popover Menus (Attachment '+' and Slash '/') */
    .tg-popover {
      position: absolute;
      bottom: 64px;
      left: 16px;
      background: #17212b;
      border: 1px solid var(--tg-border-light);
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
      width: 280px;
      padding: 6px;
      z-index: 50;
      display: none;
      flex-direction: column;
      gap: 2px;
    }
    .tg-popover.open { display: flex; }
    .tg-popover-item {
      padding: 8px 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-size: 12.5px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .tg-popover-item:hover { background: var(--tg-surface-hover); color: var(--tg-primary); }
    .tg-popover-icon {
      color: var(--tg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Mention Autocomplete Dropdown */
    .tg-mention-popover {
      position: absolute;
      bottom: 64px;
      left: 60px;
      background: #17212b;
      border: 1px solid var(--tg-border-light);
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
      width: 290px;
      padding: 6px;
      z-index: 50;
      display: none;
      flex-direction: column;
      gap: 2px;
      max-height: 240px;
      overflow-y: auto;
    }
    .tg-mention-popover.open { display: flex; }

    /* Canvas Panel (Side-by-Side or Sliding Drawer) */
    .tg-canvas-panel {
      width: 0;
      background: #17212b;
      border-left: 1px solid var(--tg-border);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 40;
    }
    .tg-canvas-panel.open {
      width: 620px;
      min-width: 620px;
    }
    .tg-canvas-header {
      padding: 12px 18px;
      border-bottom: 1px solid var(--tg-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #141c24;
    }
    .tg-canvas-tabs {
      display: flex;
      gap: 4px;
      overflow-x: auto;
    }
    .tg-c-tab {
      background: transparent;
      border: 1px solid transparent;
      color: var(--tg-text-muted);
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tg-c-tab:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
    .tg-c-tab.active {
      color: #fff;
      background: #242f3d;
      border-color: rgba(255, 255, 255, 0.1);
      font-weight: 500;
    }
    .tg-canvas-body {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Sheets Table Style */
    .sheet-wrapper {
      background: #0e1621;
      border: 1px solid var(--tg-border);
      border-radius: 8px;
      overflow: hidden;
    }
    .sheet-toolbar {
      padding: 8px 12px;
      background: #1a2530;
      border-bottom: 1px solid var(--tg-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .sheet-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    .sheet-table th {
      background: #202b36;
      padding: 8px 10px;
      font-weight: 600;
      border: 1px solid var(--tg-border);
      color: #fff;
    }
    .sheet-table td {
      padding: 8px 10px;
      border: 1px solid var(--tg-border);
      color: #cbd5e1;
      background: #0e1621;
    }
    .sheet-table td:focus {
      outline: 2px solid var(--tg-primary);
      background: #141f2c;
    }

    /* Slides Deck Viewer */
    .slide-viewer {
      background: #0e1621;
      border: 1px solid var(--tg-border);
      border-radius: 10px;
      padding: 24px;
      min-height: 280px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .slide-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--tg-border);
    }

    /* Live Preview Iframe Container */
    .sandbox-preview-container {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      height: 300px;
      border: 1px solid var(--tg-border);
    }
    .sandbox-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Cards */
    .tg-card {
      background: #0e1621;
      border: 1px solid var(--tg-border);
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Modal Backdrop */
    .tg-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .tg-modal-backdrop.open { display: flex; }
    .tg-modal {
      background: #17212b;
      border: 1px solid var(--tg-border-light);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
      width: 520px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .tg-modal-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--tg-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tg-modal-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tg-modal-close {
      background: transparent;
      border: none;
      color: var(--tg-text-muted);
      cursor: pointer;
      font-size: 20px;
    }
    .tg-modal-close:hover { color: #fff; }
    .tg-modal-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 75vh;
      overflow-y: auto;
    }
    .tg-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tg-label {
      font-size: 12px;
      font-weight: 500;
      color: #cbd5e1;
    }
    .tg-input, .tg-select, .tg-textarea {
      background: #242f3d;
      border: 1px solid var(--tg-border);
      border-radius: 6px;
      padding: 8px 12px;
      color: #fff;
      font-size: 13px;
      outline: none;
      font-family: inherit;
    }
    .tg-input:focus, .tg-select:focus, .tg-textarea:focus {
      border-color: var(--tg-primary);
    }
    .tg-modal-footer {
      padding: 12px 18px;
      border-top: 1px solid var(--tg-border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      background: #141c24;
    }

    /* Global Command Palette (⌘K) */
    .tg-cmd-palette {
      width: 580px;
      max-width: 92vw;
      background: #17212b;
      border: 1px solid var(--tg-border-light);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
    }
    .tg-cmd-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--tg-border);
      display: flex;
      align-items: center;
      gap: 12px;
      background: #1c2734;
    }
    .tg-cmd-input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 15px;
      width: 100%;
    }
    .tg-cmd-list {
      max-height: 340px;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tg-cmd-item {
      padding: 10px 14px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      color: #fff;
      font-size: 13px;
      transition: background 0.15s;
    }
    .tg-cmd-item:hover, .tg-cmd-item.selected {
      background: var(--tg-surface-active);
    }
    .tg-cmd-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tg-cmd-meta {
      font-size: 11px;
      color: var(--tg-text-muted);
    }
  </style>
</head>
<body>

  <!-- Telegram Left Sidebar (Persistent Channels, Employees, Second Brain) -->
  <aside class="tg-sidebar">
    <div class="tg-sidebar-header">
      <button class="tg-menu-btn" onclick="openCommandPalette()" title="GenTeam Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div class="tg-search-bar" onclick="openCommandPalette()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search swarm or ⌘K..." readonly>
        <span class="tg-search-shortcut">⌘K</span>
      </div>
    </div>

    <!-- Telegram Folders Tabs -->
    <div class="tg-tabs-bar">
      <button class="tg-tab-btn active" onclick="switchFolder('all')">
        All <span class="tg-tab-badge" id="badgeAll">8</span>
      </button>
      <button class="tg-tab-btn" onclick="switchFolder('channels')">
        Channels
      </button>
      <button class="tg-tab-btn" onclick="switchFolder('employees')">
        Employees
      </button>
      <button class="tg-tab-btn" onclick="switchFolder('canvas')">
        Canvases
      </button>
      <button class="tg-tab-btn" onclick="switchFolder('brain')">
        Second Brain
      </button>
    </div>

    <!-- Chat Lists -->
    <div id="chatListContainer" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
      
      <!-- Channels Category -->
      <div class="sidebar-category" id="secChannels">
        <span>Team Channels</span>
        <span class="sidebar-action-link" onclick="openCommandPalette()">+ Directive</span>
      </div>
      <ul class="tg-chat-list" id="channelsList" style="flex: 0 0 auto;">
        <li class="tg-chat-item active" onclick="switchChat('general-swarm', '#general-swarm', '6 digital employees active', '#6366f1')">
          <div class="tg-avatar" style="background: linear-gradient(135deg, #0284c7, #6366f1);">#</div>
          <div class="tg-chat-info">
            <div class="tg-chat-top">
              <span class="tg-chat-name">#general-swarm</span>
              <span class="tg-chat-time">10:16</span>
            </div>
            <div class="tg-chat-bottom">
              <span class="tg-chat-preview">Gabriel: Dispatched audit notification...</span>
              <span class="tg-unread-badge">3</span>
            </div>
          </div>
        </li>

        <li class="tg-chat-item" onclick="switchChat('dev-scaffold', '#dev-scaffold', 'Raphael, Michael active', '#f59e0b')">
          <div class="tg-avatar" style="background: #f59e0b;">#</div>
          <div class="tg-chat-info">
            <div class="tg-chat-top">
              <span class="tg-chat-name">#dev-scaffold</span>
              <span class="tg-chat-time">09:42</span>
            </div>
            <div class="tg-chat-bottom">
              <span class="tg-chat-preview">Raphael: Code sandbox generated</span>
              <span class="tg-pin-icon">📌</span>
            </div>
          </div>
        </li>

        <li class="tg-chat-item" onclick="switchChat('security-audit', '#security-audit', 'Dwayne, Seraphim, Michael', '#ec4899')">
          <div class="tg-avatar" style="background: #ec4899;">#</div>
          <div class="tg-chat-info">
            <div class="tg-chat-top">
              <span class="tg-chat-name">#security-audit</span>
              <span class="tg-chat-time">09:20</span>
            </div>
            <div class="tg-chat-bottom">
              <span class="tg-chat-preview">Dwayne: Competitor pricing scan verified</span>
            </div>
          </div>
        </li>

        <li class="tg-chat-item" onclick="switchChat('product-launch', '#product-launch', 'Ann, Ryan, Raphael', '#10b981')">
          <div class="tg-avatar" style="background: #10b981;">#</div>
          <div class="tg-chat-info">
            <div class="tg-chat-top">
              <span class="tg-chat-name">#product-launch</span>
              <span class="tg-chat-time">Yesterday</span>
            </div>
            <div class="tg-chat-bottom">
              <span class="tg-chat-preview">Ryan: Landing page copy & slides updated</span>
            </div>
          </div>
        </li>
      </ul>

      <!-- Digital Employees Category -->
      <div class="sidebar-category" id="secEmployees">
        <span>Digital Employees</span>
        <span class="sidebar-action-link" onclick="openDeployRoleModal()">+ Deploy</span>
      </div>
      <ul class="tg-chat-list" id="employeesList">
        <!-- Will be dynamically populated and updated from /api/agents -->
      </ul>

      <!-- Second Brain Category (visible when Brain tab clicked) -->
      <div class="sidebar-category" id="secBrain" style="display: none;">
        <span>Second Brain Memory</span>
        <span class="sidebar-action-link" onclick="openAddKnowledgeModal()">+ Add Context</span>
      </div>
      <ul class="tg-chat-list" id="brainList" style="display: none;">
        <!-- Populated from Second Brain -->
      </ul>
    </div>

    <!-- Sidebar Bottom Status Footer -->
    <div class="tg-sidebar-footer">
      <div class="user-pill">
        <div class="user-avatar-sm">LV</div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 500; color: #fff;">lvluplabs46201</span>
          <span style="font-size: 10px; color: var(--tg-text-muted);">GenTeam Admin</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--tg-online);"></span>
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--tg-online);">UDS:3000 OK</span>
      </div>
    </div>
  </aside>

  <!-- Main Workspace Container (Chat + Canvas side by side) -->
  <div class="tg-workspace-container">
    
    <!-- Central Telegram Chat Viewport -->
    <main class="tg-main">
      
      <!-- Top Chat Header -->
      <header class="tg-header">
        <div class="tg-header-left" onclick="toggleCanvasPanel()">
          <div class="tg-avatar" id="headerAvatar" style="width: 38px; height: 38px; background: linear-gradient(135deg, #0284c7, #6366f1); font-size: 15px;">
            #
          </div>
          <div class="tg-header-details">
            <span class="tg-header-title" id="headerTitle">
              #general-swarm
            </span>
            <span class="tg-header-subtitle" id="headerSubtitle">6 digital employees active</span>
          </div>
        </div>

        <!-- Header Action Toolbar -->
        <div class="tg-header-tools">
          <button class="tg-tool-btn" id="btnSplitCanvas" onclick="toggleCanvasPanel()" title="Toggle Split-Screen Canvas">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            <span id="canvasBtnLabel">Open Canvas</span>
          </button>

          <button class="tg-tool-btn" onclick="openCallModal()" title="Call For Me (Voice Agent)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call For Me
          </button>

          <button class="tg-tool-btn" onclick="openDeployRoleModal()" title="Deploy Ready-Made or Custom Digital Employee">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
            + Deploy Role
          </button>
        </div>
      </header>

      <!-- Telegram Pinned Directive Ribbon -->
      <div class="tg-pinned-ribbon" onclick="jumpToPinnedDirective()">
        <div class="tg-pinned-left">
          <span class="tg-pinned-title">📌 Pinned Directive:</span>
          <span class="tg-pinned-text" id="pinnedDirectiveText">Scaffold authentication module with JWT verify and notify audit channel</span>
        </div>
        <span style="font-size: 11px; color: var(--tg-primary); font-weight: 500;">View DAG &rarr;</span>
      </div>

      <!-- Typing Banner -->
      <div id="tgTypingIndicator" class="tg-typing-indicator">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--tg-primary); animation: pulse 1s infinite;"></span>
        <span id="typingMessage">Ann (Operations Coordinator) is reasoning and planning Kahn execution tree...</span>
      </div>

      <!-- Messages Stream -->
      <div id="tgMessagesScroll" class="tg-messages-scroll">
        <div class="tg-date-divider">Today</div>
        <div id="messagesList" style="display: flex; flex-direction: column; gap: 12px;"></div>
      </div>

      <!-- Telegram Bottom Input Bar with Attachments -->
      <footer class="tg-input-bar">
        
        <!-- Attachment Plus Menu Button -->
        <button class="tg-input-icon" id="btnAttachment" title="Anchor Context / Action Menu (+)" onclick="toggleAttachmentMenu()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        <!-- Slash Command Menu Button -->
        <button class="tg-input-icon" title="Commands (/)" onclick="toggleSlashMenu()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/></svg>
        </button>

        <!-- Message Input Field with Context Tags -->
        <div class="tg-input-wrapper">
          <div id="activeContextsBar" class="tg-active-contexts-bar" style="display: none;"></div>
          <textarea id="tgTextInput" class="tg-text-input" rows="1" placeholder="Direct the GenTeam swarm or type @ to mention an agent..."></textarea>
        </div>

        <!-- Send Paper Plane Button -->
        <button id="tgSendBtn" class="tg-send-btn" onclick="sendMessage()" title="Send Directive / Message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>

        <!-- Attachment Popover Menu -->
        <div id="attachmentPopover" class="tg-popover">
          <div class="tg-popover-item" onclick="anchorSecondBrainContext()">
            <span class="tg-popover-icon">🧠</span>
            <div>
              <div style="font-weight: 500;">Anchor Second Brain</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Attach architecture doc, email, or DB schema</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="openDeployRoleModal()">
            <span class="tg-popover-icon">🤖</span>
            <div>
              <div style="font-weight: 500;">Deploy Digital Employee</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Onboard Ann, Ryan, Dwayne, or custom</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="openCanvasDrawerTab('sheet')">
            <span class="tg-popover-icon">📊</span>
            <div>
              <div style="font-weight: 500;">AI Sheets Canvas</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Editable pricing & latency matrix</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="openCanvasDrawerTab('deck')">
            <span class="tg-popover-icon">📑</span>
            <div>
              <div style="font-weight: 500;">AI Slides & Pitch Deck</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Interactive presentation slides</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="openCanvasDrawerTab('code')">
            <span class="tg-popover-icon">💻</span>
            <div>
              <div style="font-weight: 500;">Code Sandbox</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">TypeScript & live prototype canvas</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="openCallModal()">
            <span class="tg-popover-icon">📞</span>
            <div>
              <div style="font-weight: 500;">Call For Me Voice Agent</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Schedule autonomous phone recap</div>
            </div>
          </div>
        </div>

        <!-- Slash Command Popover -->
        <div id="slashPopover" class="tg-popover" style="left: 54px;">
          <div class="tg-popover-item" onclick="selectCommand('/directive ')">
            <span class="tg-popover-icon">⚡</span>
            <div>
              <div style="font-weight: 500;">/directive &lt;prompt&gt;</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Decompose prayer into Kahn DAG</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="selectCommand('/call ')">
            <span class="tg-popover-icon">📞</span>
            <div>
              <div style="font-weight: 500;">/call &lt;vendor&gt; &lt;topic&gt;</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Initiate autonomous phone recap</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="selectCommand('/deploy ')">
            <span class="tg-popover-icon">🤖</span>
            <div>
              <div style="font-weight: 500;">/deploy &lt;name&gt; &lt;role&gt;</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Spawn new digital employee</div>
            </div>
          </div>
          <div class="tg-popover-item" onclick="selectCommand('/canvas ')">
            <span class="tg-popover-icon">🎨</span>
            <div>
              <div style="font-weight: 500;">/canvas &lt;sheet|code|deck&gt;</div>
              <div style="font-size: 11px; color: var(--tg-text-muted);">Open specialized side canvas</div>
            </div>
          </div>
        </div>

        <!-- Mention Autocomplete Popover -->
        <div id="mentionPopover" class="tg-mention-popover"></div>

      </footer>
    </main>

    <!-- Right-Side Specialized Execution Canvas Panel (Split Screen or Slide Drawer) -->
    <aside id="canvasPanel" class="tg-canvas-panel">
      <div class="tg-canvas-header">
        <div class="tg-canvas-tabs">
          <button class="tg-c-tab active" id="cTabSheet" onclick="switchCanvasTab('sheet')">
            <span>📊</span> AI Sheet
          </button>
          <button class="tg-c-tab" id="cTabDeck" onclick="switchCanvasTab('deck')">
            <span>📑</span> Slides Deck
          </button>
          <button class="tg-c-tab" id="cTabCode" onclick="switchCanvasTab('code')">
            <span>💻</span> Code Sandbox
          </button>
          <button class="tg-c-tab" id="cTabDag" onclick="switchCanvasTab('dag')">
            <span>🔀</span> Workflow DAG
          </button>
          <button class="tg-c-tab" id="cTabBrain" onclick="switchCanvasTab('brain')">
            <span>🧠</span> Second Brain
          </button>
        </div>
        <button class="tg-menu-btn" onclick="toggleCanvasPanel()" title="Close Canvas">
          &times;
        </button>
      </div>

      <div class="tg-canvas-body">

        <!-- TAB 1: AI SHEETS CANVAS -->
        <div id="canvasTabSheetContent" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 14px; color: #fff; font-weight: 700;">Model Pricing & Latency Consensus Matrix</h3>
              <p style="font-size: 11.5px; color: var(--tg-text-muted);">Auto-researched live grid. Click any cell to edit or calculate formulas.</p>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="tg-tool-btn" onclick="addSheetRow()">+ Row</button>
              <button class="tg-tool-btn" onclick="exportSheetCSV()">Export CSV</button>
              <button class="tg-tool-btn" onclick="saveSheetCanvas()" style="background: var(--tg-primary);">Save</button>
            </div>
          </div>

          <div class="sheet-wrapper">
            <div class="sheet-toolbar">
              <span id="sheetSelectedCell">Selected: Cell A1</span>
              <span style="color: var(--tg-online); font-weight: 500;">✓ Synced with Second Brain</span>
            </div>
            <div style="overflow-x: auto;">
              <table class="sheet-table" id="interactiveSheet">
                <thead>
                  <tr>
                    <th>Provider / Model</th>
                    <th>Latency (p50)</th>
                    <th>Cost / 1k Tokens</th>
                    <th>Benchmark</th>
                    <th>Consensus</th>
                  </tr>
                </thead>
                <tbody id="sheetBody">
                  <tr>
                    <td contenteditable="true">Local Ollama (qwen2.5:7b)</td>
                    <td contenteditable="true">115ms</td>
                    <td contenteditable="true">$0.0000</td>
                    <td contenteditable="true">94.2%</td>
                    <td contenteditable="true" style="color: var(--tg-online); font-weight: 700;">AGREE</td>
                  </tr>
                  <tr>
                    <td contenteditable="true">Gemini 2.0 Flash (Seraphim)</td>
                    <td contenteditable="true">210ms</td>
                    <td contenteditable="true">$0.0001</td>
                    <td contenteditable="true">98.4%</td>
                    <td contenteditable="true" style="color: var(--tg-online); font-weight: 700;">AGREE</td>
                  </tr>
                  <tr>
                    <td contenteditable="true">Claude 3.5 Sonnet</td>
                    <td contenteditable="true">540ms</td>
                    <td contenteditable="true">$0.0030</td>
                    <td contenteditable="true">99.1%</td>
                    <td contenteditable="true" style="color: var(--tg-online); font-weight: 700;">AGREE</td>
                  </tr>
                  <tr>
                    <td contenteditable="true">GPT-4o (OpenAI)</td>
                    <td contenteditable="true">480ms</td>
                    <td contenteditable="true">$0.0025</td>
                    <td contenteditable="true">97.8%</td>
                    <td contenteditable="true" style="color: var(--tg-online); font-weight: 700;">AGREE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="tg-card">
            <span style="font-weight: 700; color: #fff;">Consensus Breakdown</span>
            <div style="font-size: 12px; color: var(--tg-text-muted);">
              Metatron evaluated 4 model outputs for directive <code>dir-scaffold-01</code>.
              Agreement threshold: <strong>80.0% achieved</strong>. Primary routing confirmed to local daemon with Seraphim cloud fallback.
            </div>
          </div>
        </div>

        <!-- TAB 2: AI SLIDES / PITCH DECK CANVAS -->
        <div id="canvasTabDeckContent" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 14px; color: #fff; font-weight: 700;">GenTeam Swarm Operations Pitch Deck</h3>
              <p style="font-size: 11.5px; color: var(--tg-text-muted);">Fact-checked presentation deck synthesized by Ann & Ryan.</p>
            </div>
            <button class="tg-tool-btn" onclick="toggleFullscreenSlide()">Present Fullscreen</button>
          </div>

          <div class="slide-viewer" id="slideViewer">
            <div id="slideContent">
              <span style="font-size: 11px; color: var(--tg-primary); font-weight: 700; text-transform: uppercase;">Slide 1 / 4 · Overview</span>
              <h2 style="font-size: 20px; color: #fff; margin: 12px 0 8px;">Empyrean GenTeam Operations</h2>
              <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                A Telegram-native enterprise operations layer bridging autonomous digital employees, persistent Second Brain context, and live execution sandboxes.
              </p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px;">
                <div class="tg-card" style="padding: 10px;">
                  <strong style="color: #60a5fa;">🧠 YHWH & Ann</strong>
                  <span style="font-size: 11px; color: var(--tg-text-muted);">Triage & Kahn DAG Decomposition</span>
                </div>
                <div class="tg-card" style="padding: 10px;">
                  <strong style="color: #34d399;">⚡ Michael Orchestrator</strong>
                  <span style="font-size: 11px; color: var(--tg-text-muted);">Topological Task Scheduling</span>
                </div>
              </div>
            </div>

            <div class="slide-nav">
              <button class="tg-tool-btn" onclick="prevSlide()">&larr; Previous</button>
              <span id="slideCounter" style="font-size: 12px; font-weight: 600; color: #fff;">1 of 4</span>
              <button class="tg-tool-btn" onclick="nextSlide()">Next &rarr;</button>
            </div>
          </div>
        </div>

        <!-- TAB 3: CODE SANDBOX CANVAS WITH LIVE PREVIEW -->
        <div id="canvasTabCodeContent" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 14px; color: #fff; font-weight: 700;">AI Design & Code Sandbox</h3>
              <p style="font-size: 11.5px; color: var(--tg-text-muted);">Generated by Raphael (Engineer Bot). Includes live component rendering.</p>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="tg-tool-btn" id="btnToggleSandboxView" onclick="toggleSandboxPreviewMode()">Show Live Preview</button>
              <button class="tg-tool-btn" onclick="copySandboxCode()">Copy Code</button>
              <button class="tg-tool-btn" onclick="downloadSandboxFile()">Download</button>
            </div>
          </div>

          <!-- Code View -->
          <div id="sandboxCodeWrapper">
            <pre class="tg-code-block" id="sandboxCodeDisplay" style="max-height: 340px;"></pre>
          </div>

          <!-- Live Interactive Preview View -->
          <div id="sandboxPreviewWrapper" style="display: none;">
            <div style="font-size: 11px; color: var(--tg-text-muted); margin-bottom: 6px;">Live Component Preview (Sandbox Sandbox-01):</div>
            <div class="sandbox-preview-container">
              <iframe id="sandboxIframe" class="sandbox-iframe" sandbox="allow-scripts"></iframe>
            </div>
          </div>

          <!-- Design Guidelines & Palette Inspector -->
          <div class="tg-card">
            <span style="font-weight: 700; color: #fff;">Design Guidelines & Color Palette</span>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                <span style="width: 14px; height: 14px; border-radius: 3px; background: #2481cc; border: 1px solid #fff;"></span>
                <span>Primary (#2481cc)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                <span style="width: 14px; height: 14px; border-radius: 3px; background: #17212b; border: 1px solid #fff;"></span>
                <span>Surface (#17212b)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                <span style="width: 14px; height: 14px; border-radius: 3px; background: #4fae4e; border: 1px solid #fff;"></span>
                <span>Accent Green (#4fae4e)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: WORKFLOW EXECUTION DAG -->
        <div id="canvasTabDagContent" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 14px; color: #fff; font-weight: 700;">Workflow Execution DAG</h3>
              <p style="font-size: 11.5px; color: var(--tg-text-muted);">Kahn topological order decomposed by YHWH and executed by Michael.</p>
            </div>
            <select id="dagSelect" class="tg-select" onchange="renderDag(this.value)"></select>
          </div>

          <div id="dagNodesContainer" style="display: flex; flex-direction: column; gap: 10px;"></div>
        </div>

        <!-- TAB 5: SECOND BRAIN (Shared Persistent Memory) -->
        <div id="canvasTabBrainContent" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 14px; color: #fff; font-weight: 700;">Second Brain Memory Vault</h3>
              <p style="font-size: 11.5px; color: var(--tg-text-muted);">Aggregates emails, transcripts, schemas, and specs across sessions.</p>
            </div>
            <button class="tg-tool-btn" onclick="openAddKnowledgeModal()">+ Add Context</button>
          </div>

          <div id="secondBrainItems" style="display: flex; flex-direction: column; gap: 10px;"></div>
        </div>

      </div>
    </aside>

  </div>

  <!-- MODAL 1: DEPLOY DIGITAL EMPLOYEE (GenTeam Core Feature 1) -->
  <div id="modalDeployRole" class="tg-modal-backdrop">
    <div class="tg-modal">
      <div class="tg-modal-header">
        <span class="tg-modal-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
          Deploy Digital Employee
        </span>
        <button class="tg-modal-close" onclick="closeModals()">&times;</button>
      </div>
      <div class="tg-modal-body">
        <p style="font-size: 12px; color: var(--tg-text-muted);">
          Onboard a pre-built ready-made employee or configure custom boundaries, tool capabilities, and permissions.
        </p>

        <!-- Quick Pre-Built Role Picker -->
        <div class="tg-form-group">
          <label class="tg-label">Quick Role Template:</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="tg-tool-btn" type="button" onclick="presetRole('Ann', 'Operations Coordinator', 'Triage hub routing complex tasks to optimal agents', '#818cf8', 'reason')">
              Ann (Ops Hub)
            </button>
            <button class="tg-tool-btn" type="button" onclick="presetRole('Ryan', 'Marketing Head', 'Content funnel optimizations, brand website, campaigns', '#10b981', 'comms')">
              Ryan (Marketing)
            </button>
            <button class="tg-tool-btn" type="button" onclick="presetRole('Dwayne', 'Sales Strategy & Security Analyst', 'Competitor pricing grids & outreach pipelines', '#ec4899', 'gateway')">
              Dwayne (Sales/Sec)
            </button>
            <button class="tg-tool-btn" type="button" onclick="presetRole('Elena', 'UX & Design Prototyper', 'Synthesizes interactive canvas sandboxes and UI flows', '#06b6d4', 'work')">
              Elena (Design)
            </button>
          </div>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">Employee Name:</label>
          <input type="text" id="deployName" class="tg-input" placeholder="e.g. Ann or Elena">
        </div>

        <div class="tg-form-group">
          <label class="tg-label">Role Title & Specialty:</label>
          <input type="text" id="deployRoleTitle" class="tg-input" placeholder="e.g. Operations Coordinator">
        </div>

        <div class="tg-form-group">
          <label class="tg-label">Tier / Operational Layer:</label>
          <select id="deployTier" class="tg-select">
            <option value="reason">Reasoning & Planning (YHWH tier)</option>
            <option value="control">Control & Orchestration (Michael tier)</option>
            <option value="work">Builder & Code Execution (Raphael tier)</option>
            <option value="comms">Communications & Webhooks (Gabriel tier)</option>
            <option value="gateway">Gateway & Oracles (Metatron tier)</option>
          </select>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">System Instructions & Responsibilities:</label>
          <textarea id="deployDescription" class="tg-textarea" rows="3" placeholder="Define boundaries, task routing, or tool permissions..."></textarea>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">Avatar Accent Color:</label>
          <div style="display: flex; gap: 8px;">
            <input type="color" id="deployColor" value="#818cf8" style="background: transparent; border: none; width: 36px; height: 36px; cursor: pointer;">
            <span style="font-size: 12px; color: var(--tg-text-muted); align-self: center;">Select badge color for Telegram bubbles</span>
          </div>
        </div>
      </div>
      <div class="tg-modal-footer">
        <button class="tg-tool-btn" onclick="closeModals()">Cancel</button>
        <button class="tg-tool-btn" onclick="submitDeployRole()" style="background: var(--tg-primary);">Deploy to Swarm</button>
      </div>
    </div>
  </div>

  <!-- MODAL 2: CALL FOR ME (Voice Agent Simulation) -->
  <div id="modalCall" class="tg-modal-backdrop">
    <div class="tg-modal">
      <div class="tg-modal-header">
        <span class="tg-modal-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call For Me — Autonomous Voice Recap
        </span>
        <button class="tg-modal-close" onclick="closeModals()">&times;</button>
      </div>
      <div class="tg-modal-body">
        <p style="font-size: 12px; color: var(--tg-text-muted);">
          Delegates phone outreach to digital employees. Upon call completion, audio transcripts and action items are automatically deposited into Second Brain memory.
        </p>

        <div class="tg-card">
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: #fff;">Apex Cloud Infrastructure</strong>
            <span style="color: var(--tg-online); font-size: 11px; font-weight: 700;">COMPLETED · 2m 14s</span>
          </div>
          <div style="font-size: 11.5px; color: var(--tg-text-muted);">Vendor: +1 (415) 890-2134</div>
          <div class="tg-voice-player">
            <button class="tg-voice-btn" onclick="togglePlayVoiceSample(this)">▶</button>
            <div class="tg-voice-waveform" id="sampleWaveform">
              <span class="wave-stick" style="height: 14px;"></span>
              <span class="wave-stick" style="height: 22px;"></span>
              <span class="wave-stick" style="height: 8px;"></span>
              <span class="wave-stick" style="height: 18px;"></span>
              <span class="wave-stick" style="height: 24px;"></span>
              <span class="wave-stick" style="height: 12px;"></span>
              <span class="wave-stick" style="height: 20px;"></span>
              <span class="wave-stick" style="height: 15px;"></span>
              <span class="wave-stick" style="height: 23px;"></span>
              <span class="wave-stick" style="height: 9px;"></span>
            </div>
            <span class="tg-voice-duration" id="voiceDurationDisplay">2:14</span>
          </div>
          <div style="font-size: 12px; color: #cbd5e1;">
            Confirmed dedicated socket on port 3000 and reserved 4x H100 GPU nodes for Seraphim consensus workloads.
          </div>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">Launch New Autonomous Call:</label>
          <input type="text" id="callVendorName" class="tg-input" placeholder="Vendor / Entity Name (e.g. AWS Cloud, Stripe)">
        </div>

        <div class="tg-form-group">
          <label class="tg-label">Objective / Directive:</label>
          <input type="text" id="callObjective" class="tg-input" placeholder="e.g. Confirm 99.99% SLA and rate limit tier increase">
        </div>
      </div>
      <div class="tg-modal-footer">
        <button class="tg-tool-btn" onclick="closeModals()">Close</button>
        <button class="tg-tool-btn" onclick="submitCallSimulation()" style="background: var(--tg-primary);">Dispatch Call</button>
      </div>
    </div>
  </div>

  <!-- MODAL 3: ADD SECOND BRAIN KNOWLEDGE -->
  <div id="modalAddKnowledge" class="tg-modal-backdrop">
    <div class="tg-modal">
      <div class="tg-modal-header">
        <span class="tg-modal-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Add Second Brain Context
        </span>
        <button class="tg-modal-close" onclick="closeModals()">&times;</button>
      </div>
      <div class="tg-modal-body">
        <div class="tg-form-group">
          <label class="tg-label">Context Title:</label>
          <input type="text" id="kbTitle" class="tg-input" placeholder="e.g. Q4 Competitor Pricing Strategy or Schema Spec">
        </div>
        <div class="tg-form-group">
          <label class="tg-label">Category:</label>
          <select id="kbCategory" class="tg-select">
            <option value="doc">Architecture / Document</option>
            <option value="email">Email Digest</option>
            <option value="call">Call Transcript</option>
            <option value="memory">Operational Memory Snippet</option>
          </select>
        </div>
        <div class="tg-form-group">
          <label class="tg-label">Source Identifier:</label>
          <input type="text" id="kbSource" class="tg-input" placeholder="e.g. internal://docs/v2 or gmail://inbox/481">
        </div>
        <div class="tg-form-group">
          <label class="tg-label">Content Snippet:</label>
          <textarea id="kbSnippet" class="tg-textarea" rows="4" placeholder="Enter key facts, schemas, or instructions to anchor into agent memory..."></textarea>
        </div>
      </div>
      <div class="tg-modal-footer">
        <button class="tg-tool-btn" onclick="closeModals()">Cancel</button>
        <button class="tg-tool-btn" onclick="submitKnowledgeItem()" style="background: var(--tg-primary);">Save to Brain</button>
      </div>
    </div>
  </div>

  <!-- MODAL 4: GLOBAL COMMAND PALETTE (⌘K / Ctrl+K) -->
  <div id="modalCmdPalette" class="tg-modal-backdrop" onclick="closeModalsOnBackdrop(event)">
    <div class="tg-cmd-palette">
      <div class="tg-cmd-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--tg-primary);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="cmdInput" class="tg-cmd-input" placeholder="Type a command, channel, agent, or search Second Brain..." oninput="filterCommandPalette(this.value)">
      </div>
      <div class="tg-cmd-list" id="cmdList">
        <!-- Dynamically rendered -->
      </div>
    </div>
  </div>

  <script>
    // State
    var currentChatId = 'general-swarm';
    var currentChatName = '#general-swarm';
    var currentChatSubtitle = '6 digital employees active';
    var currentChatColor = '#6366f1';
    var cachedAgents = [];
    var cachedDirectives = [];
    var cachedTasks = [];
    var cachedEvents = [];
    var cachedBrain = [];
    var cachedCanvases = [];
    var activeContexts = [];
    var isCanvasOpen = false;
    var currentSlide = 1;
    var totalSlides = 4;
    var isSandboxPreviewMode = false;

    // Slide decks content
    var slidesData = [
      {
        title: "Empyrean GenTeam Operations",
        category: "Slide 1 / 4 · Overview",
        body: "A Telegram-native enterprise operations layer bridging autonomous digital employees, persistent Second Brain context, and live execution sandboxes.",
        cards: [
          { label: "🧠 YHWH & Ann", desc: "Triage & Kahn DAG Decomposition" },
          { label: "⚡ Michael Orchestrator", desc: "Topological Task Scheduling" }
        ]
      },
      {
        title: "Kahn Topological Execution Graph",
        category: "Slide 2 / 4 · Architecture",
        body: "Every natural language directive is parsed into a Directed Acyclic Graph (DAG) with explicit dependencies resolved in zero-wait order.",
        cards: [
          { label: "🔨 Raphael Worker", desc: "Code scaffolds & DB migrations" },
          { label: "📡 Gabriel Comms", desc: "Multi-endpoint webhook fanout" }
        ]
      },
      {
        title: "Persistent Shared Second Brain",
        category: "Slide 3 / 4 · Memory",
        body: "Agents never hallucinate or reset between conversations. Memory integrates Gmail, Outlook, Call For Me voice transcripts, and code schemas.",
        cards: [
          { label: "🔗 Context Anchoring", desc: "+ icon or ⌘K attaches knowledge" },
          { label: "📊 Specialized Canvases", desc: "Interactive sheets, slides, sandboxes" }
        ]
      },
      {
        title: "Enterprise Benchmark & Consensus",
        category: "Slide 4 / 4 · Performance",
        body: "Metatron multi-model consensus checks ensure 80%+ cross-model verification before critical outputs are finalized.",
        cards: [
          { label: "⚡ Sub-250ms Local", desc: "qwen2.5:7b + Gemini 2.0 Flash" },
          { label: "🔒 Privilege Guard", desc: "Sanitizes untrusted templates" }
        ]
      }
    ];

    // Initialize
    window.addEventListener('DOMContentLoaded', function() {
      fetchMessages();
      syncData();
      setupKeybindings();
      setupMentionListener();
    });

    // Keyboard Shortcuts (⌘K / Ctrl+K, Esc)
    function setupKeybindings() {
      window.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          openCommandPalette();
        } else if (e.key === 'Escape') {
          closeModals();
          closePopovers();
        }
      });
    }

    // Switch Folders in Left Sidebar
    function switchFolder(folder) {
      document.querySelectorAll('.tg-tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
      if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
      }

      var secChannels = document.getElementById('secChannels');
      var channelsList = document.getElementById('channelsList');
      var secEmployees = document.getElementById('secEmployees');
      var employeesList = document.getElementById('employeesList');
      var secBrain = document.getElementById('secBrain');
      var brainList = document.getElementById('brainList');

      if (folder === 'all') {
        secChannels.style.display = 'flex';
        channelsList.style.display = 'block';
        secEmployees.style.display = 'flex';
        employeesList.style.display = 'block';
        secBrain.style.display = 'none';
        brainList.style.display = 'none';
      } else if (folder === 'channels') {
        secChannels.style.display = 'flex';
        channelsList.style.display = 'block';
        secEmployees.style.display = 'none';
        employeesList.style.display = 'none';
        secBrain.style.display = 'none';
        brainList.style.display = 'none';
      } else if (folder === 'employees') {
        secChannels.style.display = 'none';
        channelsList.style.display = 'none';
        secEmployees.style.display = 'flex';
        employeesList.style.display = 'block';
        secBrain.style.display = 'none';
        brainList.style.display = 'none';
      } else if (folder === 'canvas') {
        toggleCanvasPanel(true);
      } else if (folder === 'brain') {
        secChannels.style.display = 'none';
        channelsList.style.display = 'none';
        secEmployees.style.display = 'none';
        employeesList.style.display = 'none';
        secBrain.style.display = 'flex';
        brainList.style.display = 'block';
        renderBrainSidebarList();
      }
    }

    // Switch Chat View
    function switchChat(chatId, title, subtitle, color) {
      currentChatId = chatId;
      currentChatName = title;
      currentChatSubtitle = subtitle;
      currentChatColor = color || '#6366f1';

      document.querySelectorAll('.tg-chat-item').forEach(function(el) { el.classList.remove('active'); });
      if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
      }

      document.getElementById('headerTitle').textContent = title;
      document.getElementById('headerSubtitle').textContent = subtitle;
      var avatar = document.getElementById('headerAvatar');
      avatar.textContent = title.replace('#', '').slice(0, 2).toUpperCase();
      avatar.style.background = currentChatColor;

      fetchMessages();
    }

    // Fetch Messages for Current Chat
    async function fetchMessages() {
      try {
        var res = await fetch('/api/messages?chatId=' + encodeURIComponent(currentChatId));
        var messages = await res.json();
        renderMessages(messages);
      } catch (e) {
        console.error(e);
      }
    }

    // Render Messages with Telegram & GenTeam styling
    function renderMessages(messages) {
      var container = document.getElementById('messagesList');
      if (!messages || messages.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--tg-text-muted); padding: 40px; font-size: 13px;">No messages in this channel yet. Assign a task or direct the team below!</div>';
        return;
      }

      var html = '';
      for (var i = 0; i < messages.length; i++) {
        var m = messages[i];
        var isOut = m.isOutgoing;
        var initial = m.senderName ? m.senderName.replace('#', '').slice(0, 2).toUpperCase() : 'U';

        // Live Activity & Task Tracker Monitor
        var activityHtml = '';
        if (m.toolUsage) {
          activityHtml = '<div class="tg-activity-card">' +
            '<div class="tg-activity-header">' +
              '<span class="tg-activity-title">' +
                '<span style="color: var(--tg-online);">✓</span>' +
                '<span>Tool Invocation: <strong>' + m.toolUsage.tool + '</strong></span>' +
              '</span>' +
              '<span style="color: var(--tg-text-muted); font-size: 10.5px;">' + (m.toolUsage.durationMs || 150) + 'ms · Succeeded</span>' +
            '</div>' +
            '<div class="tg-step-tracker">' +
              '<span class="tg-step-pill completed">✓ 1. Intent Decomposed</span>' +
              '<span class="tg-step-pill completed">✓ 2. Topological Dispatched</span>' +
              '<span class="tg-step-pill completed">✓ 3. Execution Verified</span>' +
            '</div>' +
          '</div>';
        }

        // Specialized Canvas Attachment
        var canvasHtml = '';
        if (m.canvasAttachment) {
          var typeIcon = m.canvasAttachment.type === 'sheet' ? '📊' : m.canvasAttachment.type === 'code' ? '💻' : m.canvasAttachment.type === 'call' ? '📞' : '🔀';
          canvasHtml = '<div class="tg-canvas-card" onclick="openCanvasDrawerTab(\\'' + m.canvasAttachment.type + '\\', \\'' + m.canvasAttachment.id + '\\')">' +
            '<div class="tg-canvas-info">' +
              '<span style="font-size: 16px;">' + typeIcon + '</span>' +
              '<span>Open Canvas: <strong>' + m.canvasAttachment.title + '</strong></span>' +
            '</div>' +
            '<span class="tg-canvas-btn">View Deliverable &rarr;</span>' +
          '</div>';
        }

        // Code block
        var codeHtml = '';
        if (m.code) {
          codeHtml = '<pre class="tg-code-block">' + escapeHtml(m.code) + '</pre>';
        }

        // Inline Action Buttons (Telegram keyboard)
        var buttonsHtml = '';
        if (m.inlineButtons && m.inlineButtons.length > 0) {
          buttonsHtml = '<div class="tg-inline-keyboard">';
          for (var b = 0; b < m.inlineButtons.length; b++) {
            var btn = m.inlineButtons[b];
            buttonsHtml += '<button class="tg-inline-btn" onclick="handleInlineAction(\\'' + btn.action + '\\')">' + btn.text + '</button>';
          }
          buttonsHtml += '</div>';
        }

        html += '<div class="tg-msg-wrapper ' + (isOut ? 'outgoing' : '') + '">' +
          (!isOut ? '<div class="tg-avatar" style="width: 34px; height: 34px; font-size: 12px; background: ' + (m.senderAvatarColor || '#5288c1') + ';">' + initial + '</div>' : '') +
          '<div class="tg-msg-bubble">' +
            (!isOut ? '<div class="tg-msg-sender" style="color: ' + (m.senderAvatarColor || '#818cf8') + ';"><span>' + m.senderName + '</span><span class="tg-role-tag">Digital Employee</span></div>' : '') +
            '<div class="tg-msg-text">' + formatMarkdownText(m.text) + '</div>' +
            activityHtml +
            codeHtml +
            canvasHtml +
            buttonsHtml +
            '<div class="tg-msg-footer">' +
              '<span class="tg-msg-time">' + m.timestamp + '</span>' +
              (isOut ? '<span class="tg-checkmarks">✓✓</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }

      container.innerHTML = html;
      scrollToBottom();
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatMarkdownText(txt) {
      if (!txt) return '';
      var backtickRegex = new RegExp('\\x60(.*?)\\x60', 'g');
      return escapeHtml(txt)
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(backtickRegex, '<code style="background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;">$1</code>')
        .replace(/\\n/g, '<br>');
    }

    function scrollToBottom() {
      var scroll = document.getElementById('tgMessagesScroll');
      scroll.scrollTop = scroll.scrollHeight;
    }

    // Send Message / Directive
    async function sendMessage() {
      var input = document.getElementById('tgTextInput');
      var text = input.value.trim();
      if (!text && activeContexts.length === 0) return;

      // Prepend anchored Second Brain contexts if attached
      if (activeContexts.length > 0) {
        var contextPrefix = activeContexts.map(function(c) {
          return '[Second Brain Context: "' + c.title + '" (' + c.source + ')]';
        }).join(' ');
        text = contextPrefix + ' ' + text;
      }

      var btn = document.getElementById('tgSendBtn');
      var typing = document.getElementById('tgTypingIndicator');
      var typingMsg = document.getElementById('typingMessage');

      btn.disabled = true;
      typing.style.display = 'flex';
      typingMsg.textContent = 'Ann (Operations Coordinator) is analyzing directive and executing DAG...';

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            chatId: currentChatId,
            contexts: activeContexts
          })
        });

        input.value = '';
        clearActiveContexts();
        closePopovers();
        fetchMessages();
        syncData();
      } catch (err) {
        console.error(err);
      } finally {
        btn.disabled = false;
        setTimeout(function() {
          typing.style.display = 'none';
          fetchMessages();
          syncData();
        }, 1800);
      }
    }

    // Press Enter to Send
    document.getElementById('tgTextInput')?.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Toggle Popover Menus
    function toggleAttachmentMenu() {
      var popover = document.getElementById('attachmentPopover');
      var slash = document.getElementById('slashPopover');
      slash.classList.remove('open');
      popover.classList.toggle('open');
    }

    function toggleSlashMenu() {
      var popover = document.getElementById('slashPopover');
      var attach = document.getElementById('attachmentPopover');
      attach.classList.remove('open');
      popover.classList.toggle('open');
    }

    function closePopovers() {
      document.getElementById('attachmentPopover').classList.remove('open');
      document.getElementById('slashPopover').classList.remove('open');
      document.getElementById('mentionPopover').classList.remove('open');
    }

    function selectCommand(cmd) {
      var input = document.getElementById('tgTextInput');
      input.value = cmd;
      input.focus();
      closePopovers();
    }

    // Setup @mention autocomplete
    function setupMentionListener() {
      var input = document.getElementById('tgTextInput');
      var popover = document.getElementById('mentionPopover');

      input.addEventListener('input', function() {
        var val = input.value;
        var lastWord = val.split(/\\s+/).pop();
        if (lastWord.startsWith('@')) {
          var query = lastWord.slice(1).toLowerCase();
          var matches = cachedAgents.filter(function(a) {
            return a.display_name.toLowerCase().includes(query) || a.role_title.toLowerCase().includes(query);
          });
          if (matches.length > 0) {
            popover.innerHTML = matches.map(function(a) {
              return '<div class="tg-popover-item" onclick="insertMention(\\'' + a.display_name.split(' ')[0] + '\\')">' +
                '<span class="tg-popover-icon" style="font-weight: 700; color: ' + (a.tier === 'reason' ? '#818cf8' : '#0284c7') + ';">' + a.display_name.slice(0, 1) + '</span>' +
                '<div>' +
                  '<div style="font-weight: 500;">' + a.display_name + '</div>' +
                  '<div style="font-size: 11px; color: var(--tg-text-muted);">' + a.role_title + '</div>' +
                '</div>' +
              '</div>';
            }).join('');
            popover.classList.add('open');
          } else {
            popover.classList.remove('open');
          }
        } else {
          popover.classList.remove('open');
        }
      });
    }

    function insertMention(name) {
      var input = document.getElementById('tgTextInput');
      var words = input.value.split(/\\s+/);
      words.pop();
      words.push('@' + name + ' ');
      input.value = words.join(' ');
      input.focus();
      closePopovers();
    }

    // Second Brain Context Anchoring
    function anchorSecondBrainContext() {
      closePopovers();
      if (cachedBrain.length === 0) {
        alert('No Second Brain items available yet. Add one in the Second Brain canvas!');
        return;
      }
      var first = cachedBrain[0];
      activeContexts.push(first);
      renderActiveContexts();
    }

    function anchorItemById(id) {
      var found = cachedBrain.find(function(b) { return b.id === id; });
      if (found && !activeContexts.some(function(c) { return c.id === id; })) {
        activeContexts.push(found);
        renderActiveContexts();
        closeModals();
      }
    }

    function renderActiveContexts() {
      var bar = document.getElementById('activeContextsBar');
      if (activeContexts.length === 0) {
        bar.style.display = 'none';
        bar.innerHTML = '';
        return;
      }
      bar.style.display = 'flex';
      bar.innerHTML = activeContexts.map(function(c, idx) {
        return '<span class="tg-context-pill">' +
          '<span>🧠 ' + c.title + '</span>' +
          '<span class="tg-context-remove" onclick="removeActiveContext(' + idx + ')">&times;</span>' +
        '</span>';
      }).join('');
    }

    function removeActiveContext(idx) {
      activeContexts.splice(idx, 1);
      renderActiveContexts();
    }

    function clearActiveContexts() {
      activeContexts = [];
      renderActiveContexts();
    }

    // Toggle Specialized Execution Canvas Panel (Split Screen)
    function toggleCanvasPanel(forceOpen) {
      var panel = document.getElementById('canvasPanel');
      var btn = document.getElementById('btnSplitCanvas');
      var label = document.getElementById('canvasBtnLabel');

      if (forceOpen === true) {
        panel.classList.add('open');
        isCanvasOpen = true;
      } else {
        panel.classList.toggle('open');
        isCanvasOpen = panel.classList.contains('open');
      }

      if (isCanvasOpen) {
        btn.classList.add('active');
        label.textContent = 'Close Canvas';
      } else {
        btn.classList.remove('active');
        label.textContent = 'Open Canvas';
      }
    }

    function openCanvasDrawerTab(tabName, id) {
      toggleCanvasPanel(true);
      switchCanvasTab(tabName);
    }

    // Switch Canvas Tabs
    function switchCanvasTab(tab) {
      document.querySelectorAll('.tg-c-tab').forEach(function(t) { t.classList.remove('active'); });
      document.getElementById('cTab' + tab.charAt(0).toUpperCase() + tab.slice(1))?.classList.add('active');

      document.getElementById('canvasTabSheetContent').style.display = tab === 'sheet' ? 'flex' : 'none';
      document.getElementById('canvasTabDeckContent').style.display = tab === 'deck' ? 'flex' : 'none';
      document.getElementById('canvasTabCodeContent').style.display = tab === 'code' ? 'flex' : 'none';
      document.getElementById('canvasTabDagContent').style.display = tab === 'dag' ? 'flex' : 'none';
      document.getElementById('canvasTabBrainContent').style.display = tab === 'brain' ? 'flex' : 'none';
    }

    // Slides Navigation
    function prevSlide() {
      if (currentSlide > 1) {
        currentSlide--;
        renderSlide();
      }
    }
    function nextSlide() {
      if (currentSlide < totalSlides) {
        currentSlide++;
        renderSlide();
      }
    }
    function renderSlide() {
      var data = slidesData[currentSlide - 1];
      var container = document.getElementById('slideContent');
      document.getElementById('slideCounter').textContent = currentSlide + ' of ' + totalSlides;

      var cardsHtml = data.cards.map(function(c) {
        return '<div class="tg-card" style="padding: 10px;">' +
          '<strong style="color: #60a5fa;">' + c.label + '</strong>' +
          '<span style="font-size: 11px; color: var(--tg-text-muted);">' + c.desc + '</span>' +
        '</div>';
      }).join('');

      container.innerHTML = '<span style="font-size: 11px; color: var(--tg-primary); font-weight: 700; text-transform: uppercase;">' + data.category + '</span>' +
        '<h2 style="font-size: 20px; color: #fff; margin: 12px 0 8px;">' + data.title + '</h2>' +
        '<p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">' + data.body + '</p>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px;">' +
          cardsHtml +
        '</div>';
    }

    function toggleFullscreenSlide() {
      var el = document.getElementById('slideViewer');
      if (!document.fullscreenElement) {
        el.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }

    // Sheet Operations
    function addSheetRow() {
      var tbody = document.getElementById('sheetBody');
      var tr = document.createElement('tr');
      tr.innerHTML = '<td contenteditable="true">Custom Oracle Node</td>' +
        '<td contenteditable="true">180ms</td>' +
        '<td contenteditable="true">$0.0008</td>' +
        '<td contenteditable="true">96.0%</td>' +
        '<td contenteditable="true" style="color: var(--tg-online); font-weight: 700;">AGREE</td>';
      tbody.appendChild(tr);
    }

    function exportSheetCSV() {
      var rows = Array.from(document.querySelectorAll('#interactiveSheet tr'));
      var csv = rows.map(function(r) {
        return Array.from(r.querySelectorAll('th, td')).map(function(cell) {
          return '"' + cell.innerText.replace(/"/g, '""') + '"';
        }).join(',');
      }).join('\\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'empyrean_model_matrix.csv';
      a.click();
    }

    function saveSheetCanvas() {
      alert('Sheet canvas changes saved to persistent Second Brain context!');
    }

    // Code Sandbox & Live Preview Mode
    function toggleSandboxPreviewMode() {
      isSandboxPreviewMode = !isSandboxPreviewMode;
      var codeWrap = document.getElementById('sandboxCodeWrapper');
      var prevWrap = document.getElementById('sandboxPreviewWrapper');
      var btn = document.getElementById('btnToggleSandboxView');

      if (isSandboxPreviewMode) {
        codeWrap.style.display = 'none';
        prevWrap.style.display = 'block';
        btn.textContent = 'Show Code Editor';
        loadIframePreview();
      } else {
        codeWrap.style.display = 'block';
        prevWrap.style.display = 'none';
        btn.textContent = 'Show Live Preview';
      }
    }

    function loadIframePreview() {
      var iframe = document.getElementById('sandboxIframe');
      var htmlContent = '<!DOCTYPE html><html><head><style>body { font-family: -apple-system, sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; } .btn { background: #2563eb; color: #fff; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; } .card { background: #1e293b; border: 1px solid #334155; padding: 18px; border-radius: 8px; margin-top: 14px; }</style></head><body><h2 style="color: #38bdf8;">Empyrean Auth Prototype</h2><p style="color: #94a3b8; font-size: 13px;">Live rendered from Raphael\\'s scaffold module.</p><div class="card"><h4>JWT Verification Shield</h4><p style="font-size: 12px; color: #cbd5e1; margin: 8px 0;">Token validation: SHA256 verified. RBAC permissions active.</p><button class="btn" onclick="alert(\\'JWT Authenticated Successfully!\\')">Test Verification</button></div></body></html>';
      iframe.srcdoc = htmlContent;
    }

    function copySandboxCode() {
      var code = document.getElementById('sandboxCodeDisplay').textContent;
      navigator.clipboard.writeText(code);
      alert('Code copied to clipboard!');
    }

    function downloadSandboxFile() {
      var code = document.getElementById('sandboxCodeDisplay').textContent;
      var blob = new Blob([code], { type: 'text/typescript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'jwt_verifier.ts';
      a.click();
    }

    // Modal Operations
    function openDeployRoleModal() {
      closePopovers();
      document.getElementById('modalDeployRole').classList.add('open');
    }
    function openCallModal() {
      closePopovers();
      document.getElementById('modalCall').classList.add('open');
    }
    function openAddKnowledgeModal() {
      closePopovers();
      document.getElementById('modalAddKnowledge').classList.add('open');
    }
    function openCommandPalette() {
      closePopovers();
      document.getElementById('modalCmdPalette').classList.add('open');
      var input = document.getElementById('cmdInput');
      input.value = '';
      input.focus();
      filterCommandPalette('');
    }
    function closeModals() {
      document.querySelectorAll('.tg-modal-backdrop').forEach(function(m) { m.classList.remove('open'); });
    }
    function closeModalsOnBackdrop(e) {
      if (e.target.classList.contains('tg-modal-backdrop')) {
        closeModals();
      }
    }

    // Quick Role Presets
    function presetRole(name, title, desc, color, tier) {
      document.getElementById('deployName').value = name;
      document.getElementById('deployRoleTitle').value = title;
      document.getElementById('deployDescription').value = desc;
      document.getElementById('deployColor').value = color;
      document.getElementById('deployTier').value = tier;
    }

    // Submit Role Deployment
    async function submitDeployRole() {
      var name = document.getElementById('deployName').value.trim();
      var roleTitle = document.getElementById('deployRoleTitle').value.trim();
      var description = document.getElementById('deployDescription').value.trim();
      var tier = document.getElementById('deployTier').value;
      var avatarColor = document.getElementById('deployColor').value;

      if (!name || !roleTitle) {
        alert('Please specify name and role title');
        return;
      }

      try {
        await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: name,
            roleTitle: roleTitle,
            description: description,
            tier: tier,
            avatarColor: avatarColor
          })
        });

        closeModals();
        syncData();
        fetchMessages();
      } catch (e) {
        console.error(e);
      }
    }

    // Submit Call For Me Simulation
    async function submitCallSimulation() {
      var vendorName = document.getElementById('callVendorName').value.trim() || 'Stripe API Operations';
      var objective = document.getElementById('callObjective').value.trim() || 'Verified webhook routing and high-throughput SLA';

      try {
        await fetch('/api/calls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorName: vendorName,
            summary: objective,
            duration: '1m 52s'
          })
        });
        closeModals();
        fetchMessages();
      } catch (e) {
        console.error(e);
      }
    }

    // Submit Knowledge to Second Brain
    async function submitKnowledgeItem() {
      var title = document.getElementById('kbTitle').value.trim();
      var category = document.getElementById('kbCategory').value;
      var source = document.getElementById('kbSource').value.trim();
      var snippet = document.getElementById('kbSnippet').value.trim();

      if (!title || !snippet) {
        alert('Please provide title and snippet');
        return;
      }

      try {
        await fetch('/api/second-brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title,
            category: category,
            source: source || 'user://manual-entry',
            snippet: snippet,
            tags: ['custom', category]
          })
        });
        closeModals();
        syncData();
      } catch (e) {
        console.error(e);
      }
    }

    // Audio Voice Sample Player in Call Modal
    var isVoicePlaying = false;
    var voiceInterval = null;
    function togglePlayVoiceSample(btn) {
      isVoicePlaying = !isVoicePlaying;
      btn.textContent = isVoicePlaying ? '⏸' : '▶';
      var sticks = document.querySelectorAll('#sampleWaveform .wave-stick');

      if (isVoicePlaying) {
        voiceInterval = setInterval(function() {
          sticks.forEach(function(s) {
            var h = Math.floor(Math.random() * 20) + 6;
            s.style.height = h + 'px';
          });
        }, 150);
      } else {
        clearInterval(voiceInterval);
        sticks.forEach(function(s) { s.style.height = '14px'; });
      }
    }

    // Filter Command Palette
    function filterCommandPalette(q) {
      var list = document.getElementById('cmdList');
      var query = q.toLowerCase().trim();

      var items = [
        { title: '#general-swarm', category: 'Channel', action: function() { switchChat('general-swarm', '#general-swarm', '6 digital employees active', '#6366f1'); } },
        { title: '#dev-scaffold', category: 'Channel', action: function() { switchChat('dev-scaffold', '#dev-scaffold', 'Raphael, Michael active', '#f59e0b'); } },
        { title: '#security-audit', category: 'Channel', action: function() { switchChat('security-audit', '#security-audit', 'Dwayne, Seraphim, Michael', '#ec4899'); } },
        { title: 'Deploy Digital Employee', category: 'Role Action', action: function() { openDeployRoleModal(); } },
        { title: 'Call For Me (Voice Recap)', category: 'Audio Action', action: function() { openCallModal(); } },
        { title: 'Open AI Sheets Canvas', category: 'Canvas', action: function() { openCanvasDrawerTab('sheet'); } },
        { title: 'Open Slides Deck', category: 'Canvas', action: function() { openCanvasDrawerTab('deck'); } },
        { title: 'Open Code Sandbox', category: 'Canvas', action: function() { openCanvasDrawerTab('code'); } },
        { title: 'Add Second Brain Memory', category: 'Knowledge', action: function() { openAddKnowledgeModal(); } }
      ];

      cachedAgents.forEach(function(a) {
        items.push({
          title: a.display_name,
          category: 'Employee DM',
          action: function() { switchChat(a.id, a.display_name, a.role_title, a.tier === 'reason' ? '#818cf8' : '#0284c7'); }
        });
      });

      var filtered = query ? items.filter(function(i) {
        return i.title.toLowerCase().includes(query) || i.category.toLowerCase().includes(query);
      }) : items;

      list.innerHTML = filtered.map(function(item, idx) {
        return '<div class="tg-cmd-item ' + (idx === 0 ? 'selected' : '') + '" onclick="executeCmdItem(' + idx + ')">' +
          '<div class="tg-cmd-left">' +
            '<span>' + (item.category === 'Channel' ? '#' : item.category === 'Employee DM' ? '👤' : '⚡') + '</span>' +
            '<strong>' + item.title + '</strong>' +
          '</div>' +
          '<span class="tg-cmd-meta">' + item.category + '</span>' +
        '</div>';
      }).join('');

      window._currentFilteredCmds = filtered;
    }

    function executeCmdItem(idx) {
      if (window._currentFilteredCmds && window._currentFilteredCmds[idx]) {
        window._currentFilteredCmds[idx].action();
        closeModals();
      }
    }

    function jumpToPinnedDirective() {
      openCanvasDrawerTab('dag');
    }

    // Sync System Data
    async function syncData() {
      try {
        var results = await Promise.all([
          fetch('/api/directives'),
          fetch('/api/tasks'),
          fetch('/api/events'),
          fetch('/api/second-brain'),
          fetch('/api/canvases'),
          fetch('/api/agents')
        ]);

        cachedDirectives = await results[0].json();
        cachedTasks = await results[1].json();
        cachedEvents = await results[2].json();
        cachedBrain = await results[3].json();
        cachedCanvases = await results[4].json();
        cachedAgents = await results[5].json();

        renderEmployeesList(cachedAgents);
        renderDagSelect();
        renderSecondBrain(cachedBrain);
        renderCodeSandbox(cachedCanvases);

        if (cachedDirectives.length > 0) {
          document.getElementById('pinnedDirectiveText').textContent = cachedDirectives[0].text;
        }
      } catch (e) {
        console.error(e);
      }
    }

    function renderEmployeesList(agents) {
      var container = document.getElementById('employeesList');
      if (!container) return;

      container.innerHTML = agents.map(function(a) {
        var color = a.tier === 'reason' ? '#818cf8' : a.tier === 'control' ? '#0284c7' : a.tier === 'work' ? '#f59e0b' : a.tier === 'comms' ? '#10b981' : '#a855f7';
        var initial = a.display_name.slice(0, 2).toUpperCase();

        return '<li class="tg-chat-item ' + (currentChatId === a.id ? 'active' : '') + '" onclick="switchChat(\\'' + a.id + '\\', \\'' + a.display_name + '\\', \\'' + a.role_title + '\\', \\'' + color + '\\')">' +
          '<div class="tg-avatar" style="background: ' + color + ';">' +
            initial +
            '<span class="tg-online-badge ' + (a.tier === 'gateway' ? 'cloud' : '') + '"></span>' +
          '</div>' +
          '<div class="tg-chat-info">' +
            '<div class="tg-chat-top">' +
              '<span class="tg-chat-name">' + a.display_name + '</span>' +
              '<span class="tg-chat-time">online</span>' +
            '</div>' +
            '<div class="tg-chat-bottom">' +
              '<span class="tg-chat-preview">' + a.role_title + '</span>' +
            '</div>' +
          '</div>' +
        '</li>';
      }).join('');
    }

    function renderDagSelect() {
      var select = document.getElementById('dagSelect');
      if (!select) return;
      select.innerHTML = cachedDirectives.map(function(d) {
        return '<option value="' + d.id + '">' + d.id + ' — ' + d.text.slice(0, 30) + '...</option>';
      }).join('');
      if (cachedDirectives.length > 0) {
        renderDag(cachedDirectives[0].id);
      }
    }

    function renderDag(directiveId) {
      var d = cachedDirectives.find(function(x) { return x.id === directiveId; });
      var container = document.getElementById('dagNodesContainer');
      if (!d || !d.tree || !container) return;

      container.innerHTML = d.tree.nodes.map(function(node) {
        var matched = cachedTasks.find(function(t) { return t.id === node.id; });
        var state = matched ? matched.state : 'pending';
        var deps = node.dependsOn && node.dependsOn.length > 0 ? node.dependsOn.join(', ') : 'root (none)';

        return '<div class="tg-card">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">[' + node.id + ']</span>' +
            '<span style="color: var(--tg-primary); font-size: 11px; font-weight: bold; text-transform: uppercase;">' + state + '</span>' +
          '</div>' +
          '<div style="font-size: 12px; color: var(--tg-text-muted);">Kind: <strong>' + node.kind + '</strong> · Depends on: <strong>' + deps + '</strong></div>' +
          '<pre class="tg-code-block">Payload: ' + escapeHtml(JSON.stringify(node.payload, null, 2)) + '</pre>' +
        '</div>';
      }).join('');
    }

    function renderSecondBrain(items) {
      var container = document.getElementById('secondBrainItems');
      if (!container) return;

      container.innerHTML = items.map(function(item) {
        return '<div class="tg-card">' +
          '<div style="display: flex; justify-content: space-between;">' +
            '<span style="font-weight: 700; color: #fff;">' + item.title + '</span>' +
            '<span style="font-size: 10px; color: var(--tg-text-dim);">' + item.category.toUpperCase() + '</span>' +
          '</div>' +
          '<div style="font-size: 11px; color: var(--tg-text-muted);">Source: ' + item.source + '</div>' +
          '<div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">' + item.snippet + '</div>' +
          '<div style="display: flex; justify-content: flex-end; margin-top: 6px;">' +
            '<button class="tg-tool-btn" onclick="anchorItemById(\\'' + item.id + '\\')">+ Anchor to Chat</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderBrainSidebarList() {
      var container = document.getElementById('brainList');
      if (!container) return;
      container.innerHTML = cachedBrain.map(function(item) {
        return '<li class="tg-chat-item" onclick="anchorItemById(\\'' + item.id + '\\')">' +
          '<div class="tg-avatar" style="background: #6366f1; font-size: 13px;">🧠</div>' +
          '<div class="tg-chat-info">' +
            '<div class="tg-chat-top">' +
              '<span class="tg-chat-name">' + item.title + '</span>' +
              '<span class="tg-chat-time">' + item.category + '</span>' +
            '</div>' +
            '<div class="tg-chat-preview">' + item.snippet.slice(0, 45) + '...</div>' +
          '</div>' +
        '</li>';
      }).join('');
    }

    function renderCodeSandbox(canvases) {
      var codeCanvas = canvases.find(function(c) { return c.type === 'code'; });
      var target = document.getElementById('sandboxCodeDisplay');
      if (codeCanvas && target) {
        target.textContent = codeCanvas.content;
      }
    }

    function handleInlineAction(action) {
      var input = document.getElementById('tgTextInput');
      if (action === 'preset:auth') {
        input.value = 'Scaffold JWT auth module, run DB migration, and notify Slack audit channel';
        sendMessage();
      } else if (action === 'preset:migrate') {
        input.value = 'Execute database schema migration and perform workspace maintenance';
        sendMessage();
      } else if (action === 'preset:consensus') {
        input.value = 'Architect consensus review for multi-model reasoning pipeline with 80% threshold';
        sendMessage();
      } else if (action === 'preset:call') {
        openCallModal();
      }
    }

    // Auto-polling for real-time collaboration
    setInterval(function() {
      fetchMessages();
      syncData();
    }, 3500);

  </script>
</body>
</html>`;
}
