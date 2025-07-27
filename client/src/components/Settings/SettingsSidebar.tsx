

interface SidebarProps {
  sections: string[];
  current: string;
  onSelect: (section: string) => void;
}

export function SettingsSidebar({ sections, current, onSelect }: SidebarProps) {
  return (
    <nav className="w-40 min-w-[120px] bg-white/5 rounded-lg p-2 flex flex-col gap-1 text-sm">
      {sections.map((section) => (
        <button
          key={section}
          className={`text-left px-3 py-2 rounded font-medium transition-colors ${
            current === section
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow'
              : 'text-white/70 hover:bg-white/10'
          }`}
          onClick={() => onSelect(section)}
        >
          {section}
        </button>
      ))}
    </nav>
  );
}
