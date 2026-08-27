import React, { useState } from 'react';
import { 
  Files, Search as SearchIcon, GitBranch, LayoutGrid, FileText, Folder, 
  ChevronDown, ChevronRight, Settings, User, X, Plus, MoreHorizontal,
  FileCode2, FileSpreadsheet, Image as ImageIcon, MessageSquare
} from 'lucide-react';

const mockFiles = [
  { id: '1', name: 'Motion_to_Suppress.docx', type: 'word' },
  { id: '2', name: 'Discovery_Request.pdf', type: 'pdf' },
  { id: '3', name: 'Police_Report_05-12.pdf', type: 'pdf' },
  { id: '4', name: 'Timeline_Notes.txt', type: 'text' },
];

export function DocumentEditorVSCode() {
  const [activeTab, setActiveTab] = useState(mockFiles[0]);
  const [openFiles, setOpenFiles] = useState([mockFiles[0], mockFiles[3]]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [editorContent, setEditorContent] = useState(`[DRAFTING AREA]

MOTION TO SUPPRESS EVIDENCE

COMES NOW the Defendant, Alex Thompson, pro se, and respectfully moves this Court, pursuant to the Fourth Amendment of the United States Constitution and Article I, Section 11 of the Indiana Constitution, to suppress any and all evidence seized from the Defendant on May 12, 2024. 

In support of this Motion, the Defendant states as follows:
1. On May 12, 2024, Defendant was stopped by officers of the Indianapolis Metropolitan Police Department...
2. The stop was conducted without reasonable suspicion or probable cause...

WHEREFORE, the Defendant respectfully requests that this Court set this matter for a hearing, suppress the evidence obtained, and grant all other just and proper relief.`);

  const handleFileClick = (file: any) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveTab(file);
  };

  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    if (activeTab?.id === fileId) {
      setActiveTab(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'word': return <FileText size={15} className="text-blue-400" />;
      case 'pdf': return <FileCode2 size={15} className="text-red-400" />;
      case 'text': return <FileText size={15} className="text-gray-400" />;
      default: return <FileText size={15} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex h-[800px] w-full flex-col overflow-hidden rounded-xl border border-gray-800 bg-[rgba(255,255,255,0.03)] text-white/70 shadow-2xl font-sans">
      {/* VS Code Title Bar */}
      <div className="flex h-8 items-center justify-between border-b border-white/10 bg-[rgba(255,255,255,0.03)] px-4 text-xs">
        <div className="flex items-center gap-4">
          <img src="https://www.gstatic.com/mobilesdk/250721_mobilesdk/mono_firebase_dark.svg" alt="icon" className="h-4 w-4 opacity-70" />
          <div className="flex gap-3">
            <span className="cursor-pointer hover:text-white">File</span>
            <span className="cursor-pointer hover:text-white">Edit</span>
            <span className="cursor-pointer hover:text-white">Selection</span>
            <span className="cursor-pointer hover:text-white">View</span>
            <span className="cursor-pointer hover:text-white">Go</span>
            <span className="cursor-pointer hover:text-white">Run</span>
            <span className="cursor-pointer hover:text-white">Terminal</span>
            <span className="cursor-pointer hover:text-white">Help</span>
          </div>
        </div>
        <div className="text-center font-medium">Acquit.ai - Case Workspace</div>
        <div className="flex gap-3">
          <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          <span className="h-3 w-3 rounded-full bg-red-500"></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="flex w-12 flex-col items-center justify-between border-r border-white/10 bg-[rgba(255,255,255,0.03)] py-2">
          <div className="flex flex-col gap-4">
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-white border-l-2 border-white">
              <Files size={24} strokeWidth={1.5} />
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-gray-400 hover:text-white">
              <SearchIcon size={24} strokeWidth={1.5} />
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-gray-400 hover:text-white">
              <GitBranch size={24} strokeWidth={1.5} />
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-gray-400 hover:text-white">
              <MessageSquare size={24} strokeWidth={1.5} />
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-gray-400 hover:text-white">
              <LayoutGrid size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-gray-400 hover:text-white">
              <User size={24} strokeWidth={1.5} />
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center p-2 text-gray-400 hover:text-white">
              <Settings size={24} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarExpanded && (
          <div className="flex w-60 flex-col border-r border-white/10 bg-[rgba(255,255,255,0.03)]">
            <div className="flex h-9 items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Explorer
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Folder: CASE FILES */}
              <div className="flex cursor-pointer items-center gap-1 bg-[rgba(255,255,255,0.03)] px-1 py-1 text-xs text-white">
                <ChevronDown size={14} />
                <span className="font-bold uppercase">CASE FILES</span>
              </div>
              <div className="py-1">
                {/* Nested Folder: Drafts */}
                <div className="flex cursor-pointer items-center gap-1 px-4 py-1 text-xs hover:bg-[rgba(255,255,255,0.03)] hover:text-white">
                  <ChevronDown size={14} />
                  <Folder size={14} className="text-blue-400" />
                  <span>Drafts</span>
                </div>
                <div className="pl-6">
                  {mockFiles.filter(f => f.type === 'word' || f.type === 'text').map(file => (
                    <div 
                      key={file.id} 
                      onClick={() => handleFileClick(file)}
                      className={`flex cursor-pointer items-center gap-1.5 px-4 py-1 text-xs ${activeTab?.id === file.id ? 'bg-[rgba(255,255,255,0.03)] text-white' : 'hover:bg-[rgba(255,255,255,0.03)] hover:text-white'}`}
                    >
                      {getFileIcon(file.type)}
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Nested Folder: Evidence */}
                <div className="flex cursor-pointer items-center gap-1 px-4 py-1 text-xs hover:bg-[rgba(255,255,255,0.03)] hover:text-white mt-1">
                  <ChevronDown size={14} />
                  <Folder size={14} className="text-yellow-500" />
                  <span>Evidence & Discovery</span>
                </div>
                <div className="pl-6">
                  {mockFiles.filter(f => f.type === 'pdf').map(file => (
                    <div 
                      key={file.id} 
                      onClick={() => handleFileClick(file)}
                      className={`flex cursor-pointer items-center gap-1.5 px-4 py-1 text-xs ${activeTab?.id === file.id ? 'bg-[rgba(255,255,255,0.03)] text-white' : 'hover:bg-[rgba(255,255,255,0.03)] hover:text-white'}`}
                    >
                      {getFileIcon(file.type)}
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex flex-1 flex-col bg-[rgba(255,255,255,0.03)]">
          {/* Tabs */}
          <div className="flex h-9 bg-[rgba(255,255,255,0.03)] overflow-x-auto no-scrollbar">
            {openFiles.map(file => (
              <div 
                key={file.id} 
                onClick={() => setActiveTab(file)}
                className={`group flex h-full min-w-[120px] cursor-pointer items-center gap-2 border-r border-white/10 px-3 text-xs ${activeTab?.id === file.id ? 'bg-[rgba(255,255,255,0.03)] text-white border-t border-t-blue-500' : 'bg-[rgba(255,255,255,0.03)] text-gray-400 hover:bg-[rgba(255,255,255,0.03)]'}`}
              >
                {getFileIcon(file.type)}
                <span className="flex-1 truncate">{file.name}</span>
                <button 
                  onClick={(e) => handleCloseTab(e, file.id)}
                  className={`rounded p-0.5 hover:bg-[rgba(255,255,255,0.03)] ${activeTab?.id === file.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Breadcrumbs */}
          <div className="flex h-6 items-center gap-1 px-4 text-xs text-gray-400 border-b border-white/10">
            <span>acquit-workspace</span>
            <ChevronRight size={12} />
            <span>CASE FILES</span>
            <ChevronRight size={12} />
            {activeTab ? <span>{activeTab.name}</span> : <span>Welcome</span>}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden p-4 bg-[rgba(255,255,255,0.03)]">
            {activeTab ? (
              <div className="h-full w-full flex">
                {/* Line Numbers */}
                <div className="w-10 flex-shrink-0 text-right pr-4 font-mono text-sm text-white/70 select-none opacity-50">
                  {editorContent.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code Area */}
                <textarea 
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="h-full flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-white/70 outline-none"
                  spellCheck="false"
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <img src="https://www.gstatic.com/mobilesdk/250721_mobilesdk/mono_firebase_dark.svg" alt="logo" className="mb-4 h-24 w-24 opacity-20 grayscale" />
                <h2 className="text-xl">Acquit.ai Workspace</h2>
                <p className="mt-2 text-sm">Select a file from the explorer to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="flex h-6 items-center justify-between bg-[rgba(255,255,255,0.03)] px-2 text-[11px] text-white">
        <div className="flex items-center gap-3">
          <div className="flex cursor-pointer items-center gap-1 hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5">
            <GitBranch size={12} /> main
          </div>
          <div className="flex cursor-pointer items-center gap-1 hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5">
            <X size={12} className="opacity-70" /> 0 
            <span className="text-yellow-300 mx-1">⚠</span> 0
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="cursor-pointer hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5">Ln 12, Col 42</div>
          <div className="cursor-pointer hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5">Spaces: 4</div>
          <div className="cursor-pointer hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5">UTF-8</div>
          <div className="cursor-pointer hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5">Markdown</div>
          <div className="cursor-pointer hover:bg-[rgba(255,255,255,0.03)] px-1 py-0.5"><MessageSquare size={12} /></div>
        </div>
      </div>
    </div>
  );
}
