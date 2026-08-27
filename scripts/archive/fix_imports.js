const fs = require('fs');
const path = 'artifacts/mockup-sandbox/src/components/mockups/acquit-case-workspace/GoogleWorkspaceIntegration.tsx';
let content = fs.readFileSync(path, 'utf8');

const lucideImports = `
import {
  FolderOpen, FileText, Calendar, Mail, RefreshCw, ExternalLink, ShieldCheck, CheckCircle2,
  AlertCircle, Plus, Search, Download, Filter, Eye, Clock, Sparkles, Lock, ArrowUpRight,
  ChevronRight, HardDrive, FileSpreadsheet, FileCode, CalendarDays, X, Share2, Check
} from "lucide-react";
`;

content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\n' + lucideImports);

fs.writeFileSync(path, content);
