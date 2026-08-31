import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/workspace', label: 'Case Workspace' },
    { to: '/ai-lab', label: 'AI Lab' },
    { to: '/directory', label: 'Attorney Directory' },
    { to: '/academy', label: 'Acquit Academy' },
    { to: '/filing', label: 'Filing Center' },
    { to: '/library', label: 'Law Library' },
    { to: '/editor', label: 'Document Editor' },
    { to: '/timeline', label: 'Timeline' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/cylinder', label: 'Sovereign Cylinder' },
    { to: '/stitch', label: 'Stitch OS' },
    { to: '/google', label: 'Google Workspace' },
    { to: '/rag', label: 'RAG Viewer' },
    { to: '/chain-of-command', label: 'Chain of Command' },
  ];

  return (
    <nav className="bg-[#0A0A0A] border-b border-[#1A1A1A] px-4 py-3 flex items-center justify-between z-50 sticky top-0 w-full overflow-x-auto whitespace-nowrap hide-scrollbar">
      <div className="flex gap-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm font-medium transition-colors ${
              location.pathname === link.to
                ? 'text-[#D4AF37]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
