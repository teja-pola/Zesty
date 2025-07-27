import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Settings() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [preferences] = useState(profile?.preferences || {
    music: [],
    movies: [],
    books: [],
    food: [],
    fashion: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName, preferences });
      if (email !== user?.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }
      if (password) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      toast.success('Settings updated!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update settings');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
      <div className="space-y-4">
        <input
          className="w-full px-4 py-2 rounded bg-white/10 text-white"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          className="w-full px-4 py-2 rounded bg-white/10 text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full px-4 py-2 rounded bg-white/10 text-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New Password"
          type="password"
        />
        {/* Preferences display (edit UI can be added here) */}
        <div className="bg-white/5 rounded-xl p-4 text-white/80">
          <div className="font-semibold mb-2">Preferences</div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(preferences, null, 2)}</pre>
        </div>
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-xl text-white font-bold"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
