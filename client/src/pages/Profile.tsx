import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Profile as ProfileType, supabase } from '../lib/supabase';

type Preferences = NonNullable<ProfileType['preferences']>;
const defaultPrefs: Preferences = { music: [], movies: [], books: [], food: [], fashion: [] };

export function Profile() {
  const { user, profile, updateProfile, refreshAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{ full_name: string; preferences: Preferences; email: string; password: string; newPassword: string }>({
    full_name: '',
    preferences: defaultPrefs,
    email: '',
    password: '',
    newPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setForm({
        full_name: profile.full_name || '',
        preferences: profile.preferences || defaultPrefs,
        email: user.email || '',
        password: '',
        newPassword: '',
      });
    }
  }, [profile, user]);

  const handleChange = (domain: keyof Preferences, value: string) => {
    setForm(f => ({
      ...f,
      preferences: {
        ...f.preferences,
        [domain]: value.split(',').map(s => s.trim()).filter(Boolean),
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        preferences: form.preferences,
      } as Partial<ProfileType>);
      toast.success('Profile updated!');
      setEditing(false);
      refreshAuth();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    setLoading(true);
    try {
      // Use Supabase client to update email
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) throw error;
      toast.success('Email updated!');
      refreshAuth();
    } catch {
      toast.error('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      // Use Supabase client to update password
      const { error } = await supabase.auth.updateUser({ password: form.newPassword });
      if (error) throw error;
      toast.success('Password updated!');
      setChangingPassword(false);
      setForm(f => ({ ...f, password: '', newPassword: '' }));
    } catch {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-4">
        <label className="block mb-1">Full Name</label>
        <input
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          value={form.full_name}
          disabled={!editing}
          onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          value={form.email}
          disabled={!editing}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
        {editing && (
          <button className="mt-2 bg-blue-600 px-4 py-2 rounded" onClick={handleEmailChange} disabled={loading}>Change Email</button>
        )}
      </div>
      {Object.keys(form.preferences).map(domain => (
        <div className="mb-4" key={domain}>
          <label className="block mb-1 capitalize">{domain} Preferences (comma separated)</label>
          <input
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={form.preferences[domain as keyof Preferences].join(', ')}
            disabled={!editing}
            onChange={e => handleChange(domain as keyof Preferences, e.target.value)}
          />
        </div>
      ))}
      {editing && !changingPassword && (
        <button className="mb-4 bg-yellow-600 px-4 py-2 rounded" onClick={() => setChangingPassword(true)} disabled={loading}>Change Password</button>
      )}
      {editing && changingPassword && (
        <div className="mb-4">
          <label className="block mb-1">New Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
          />
          <button className="mt-2 bg-green-600 px-4 py-2 rounded" onClick={handlePasswordChange} disabled={loading}>Save Password</button>
          <button className="mt-2 ml-2 bg-gray-600 px-4 py-2 rounded" onClick={() => setChangingPassword(false)} disabled={loading}>Cancel</button>
        </div>
      )}
      <div className="flex space-x-2">
        {editing ? (
          <>
            <button className="bg-green-600 px-4 py-2 rounded" onClick={handleSave} disabled={loading}>Save</button>
            <button className="bg-gray-600 px-4 py-2 rounded" onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
          </>
        ) : (
          <button className="bg-blue-600 px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>
    </div>
  );
}
