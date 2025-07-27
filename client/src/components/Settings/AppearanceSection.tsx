import { useState } from 'react';
import toast from 'react-hot-toast';

export function AppearanceSection() {
  const [theme, setTheme] = useState('system');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Appearance settings saved!');
      setLoading(false);
    }, 800);
  };

  return (
    <section className="bg-white/5 rounded-lg p-4 shadow border border-white/10 text-sm">
      <h2 className="text-lg font-semibold mb-3 text-white">Appearance</h2>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <input type="radio" name="theme" checked={theme === 'system'} onChange={() => setTheme('system')} />
          <span className="text-white/80">System Default</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')} />
          <span className="text-white/80">Light</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
          <span className="text-white/80">Dark</span>
        </label>
      </div>
      <button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Appearance'}
      </button>
    </section>
  );
}
