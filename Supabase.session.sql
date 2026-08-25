
  "git.autofetch": true,
  "redhat.telemetry.enabled": true,
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "chat.instructionsFilesLocations": {
    ".github/instructions": true,
    ".claude/rules": true,
    "~/.copilot/instructions": true,
    "~/.claude/rules": true
  },
  "geminicodeassist.project": "performair-f62c8",
  "mssql.connectionGroups": [
    {
      "name": "ROOT",
      "id": "ROOT"
    }
  ],
  "claudeCode.preferredLocation": "panel",
  "firebase.emulators.exportOnExit": true,
  "chat.mcp.serverSampling": {
    "Global in Code: supabase": {
      "allowedModels": [
        "copilot/auto",
        "copilotcli/claude-haiku-4.5",
        "claude-code/claude-haiku-4.5",
        "copilot/claude-haiku-4.5",
        "copilotcli/gpt-4.1",
        "copilot/gpt-4.1",
        "copilot/gpt-4o",
        "copilotcli/gpt-5-mini",
        "copilot/gpt-5-mini",
        "copilot/oswe-vscode-prime"
      ]
    }
  },
  "docker.extension.enableComposeLanguageServer": false,
  "explorer.confirmDelete": false,
  "files.autoSave": "afterDelay",
  "geminicodeassist.agentYoloMode": true,
  "geminicodeassist.agentDebugMode": true,
  "geminicodeassist.outlines.automaticOutlineGeneration": true,
  "geminicodeassist.updateChannel": "Insiders",
  "geminicodeassist.inlineSuggestions.nextEditPredictions": true,
  "[css]": {
    "editor.defaultFormatter": "vscode.css-language-features"
  },
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "terminal.integrated.enableMultiLinePasteWarning": "never",
  "[markdown]": {
    "editor.defaultFormatter": "vscode.markdown-language-features"
  },
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
  "python.analysis.typeCheckingMode": "standard",
  "[dockercompose]": {
    "editor.defaultFormatter": "redhat.vscode-yaml"
  },
  "security.workspace.trust.untrustedFiles": "open",
  "window.menuBarVisibility": "classic",
  "security.workspace.trust.banner": "always",
  "jake.autoDetect": "on",
  "launch": {
    "configurations": []
  },
  "google.cloud.project": "acuit-498605",
  "jupyter.runStartupCommands": [
    "import bigframes",
    "%load_ext bigframes",
    "bigframes.options.bigquery.project = \"acuit-498605\"",
    "bigframes.options.bigquery.application_name = \"datacloud.visual studio code\""
  ],
  "google.datacloud.executeCellToolForNotebookMCP": true,

  // ——— SQLTools Settings ———
  "sqltools.connectionExplorer.groupConnected": true,
  "sqltools.results.focusOnResults": true,
  "sqltools.results.reuseTabs": "never",
  "sqltools.results.limit": 100,
  "sqltools.autoOpenSessionFiles": false,
  "sqltools.useNodeRuntime": true,
  "sqltools.connections": [
    {
      "name": "PGSQL",
      "driver": "PostgreSQL",
      "server": "db.YOUR_PROJECT_REF.supabase.co",
      "port": 5432,
      "database": "postgres",
      "username": "postgres",
      "password": "REDACTED_DB_PASSWORD",
      "askForPassword": false,
      "connectionTimeout": 30,
      "pgOptions": {
        "ssl": {
          "rejectUnauthorized": false
        }
      }
    }
  ]
}