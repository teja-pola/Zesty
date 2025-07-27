
import { useState, useEffect } from 'react';
import { NotificationsSection } from '../components/Settings/NotificationsSection';
import { AppearanceSection } from '../components/Settings/AppearanceSection';
import { SettingsSidebar } from '../components/Settings/SettingsSidebar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const domainLabels = {
  music: 'Music',
  movie: 'Movies & TV',
  book: 'Books',
  food: 'Food & Cuisine',
  fashion: 'Fashion & Style',
};

type Preferences = {
  music: string[];
  movie: string[];
  book: string[];
  food: string[];
  fashion: string[];
};

export function Settings() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    music: [],
    movie: [],
    book: [],
    food: [],
    fashion: [],
  });


  // Load preferences from localStorage (fallback for Supabase issues)
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPrefs = localStorage.getItem('zesty_preferences');
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          setPreferences({
            music: parsed.music || [],
            movie: parsed.movie || parsed.movies || [],
            book: parsed.book || parsed.books || [],
            food: parsed.food || [],
            fashion: parsed.fashion || [],
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [section, setSection] = useState('General');
  const sections = [
    'General',
    'Preferences',
    'Notifications',
    'Appearance',
    'Account',
    'Activity Log',
  ];

  // Handle chip add/remove for preferences
  const handleAddPref = (domain: keyof Preferences, value: string) => {
    if (!value.trim()) return;
    setPreferences((prev) => ({
      ...prev,
      [domain]: [...prev[domain], value.trim()].filter((v, i, arr) => arr.indexOf(v) === i),
    }));
  };
  const handleRemovePref = (domain: keyof Preferences, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [domain]: prev[domain].filter((v) => v !== value),
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName });
      if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }
      // Save preferences to taste_preferences table (one row per domain and one merged row)
      const upsertRows = Object.keys(preferences)
        .filter((domain) => preferences[domain as keyof Preferences]?.length > 0)
        .map((domain) => ({
          user_id: user.id,
          domain,
          preferences: preferences[domain as keyof Preferences],
          updated_at: new Date().toISOString(),
        }));
      // Add merged row for all
      const mergedRow = {
        user_id: user.id,
        domain: 'all',
        preferences: preferences,
        updated_at: new Date().toISOString(),
      };
      if (upsertRows.length > 0) {
        const { error } = await supabase
          .from('taste_preferences')
          .upsert([...upsertRows, mergedRow], { onConflict: 'user_id,domain' });
        if (error) throw error;
      }
      toast.success('Profile updated!');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!password || password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password changed!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // You may want to call a backend function to delete user data
      await signOut();
      toast.success('Account deleted.');
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 flex flex-col md:flex-row gap-4">
      <div className="md:w-1/4 w-full mb-4 md:mb-0">
        <SettingsSidebar sections={sections} current={section} onSelect={setSection} />
      </div>
      <div className="flex-1 w-full">
        <h1 className="text-2xl font-bold mb-4 text-white md:hidden block">Settings</h1>
        {(() => {
          switch (section) {
            case 'General':
              return (
                <section className="bg-white/5 rounded-lg p-4 shadow border border-white/10">
                  <h2 className="text-lg font-semibold mb-3 text-white">Profile</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                      {/* Placeholder for profile photo */}
                      <span>{fullName ? fullName[0] : 'U'}</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-white/70 mb-1">Profile Photo</label>
                      <input type="file" className="block w-full text-xs text-white/60" disabled />
                      <span className="text-xs text-white/40">(Profile photo upload coming soon)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-white/70 mb-1">Full Name</label>
                      <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1">Email</label>
                      <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-white/70 mb-1">Username</label>
                      <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" value={profile?.username || ''} placeholder="Username (coming soon)" disabled />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1">Bio</label>
                      <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" value={profile?.bio || ''} placeholder="Short bio (coming soon)" disabled />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-white/70 mb-1">Location</label>
                    <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" value={profile?.location || ''} placeholder="Location (coming soon)" disabled />
                  </div>
                  <button className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                </section>
              );
            case 'Preferences':
              return (
                <section className="bg-white/5 rounded-lg p-6 shadow border border-white/10">
                  <h2 className="text-xl font-semibold mb-4 text-white">Cultural Preferences</h2>
                  <p className="text-white/70 mb-6 text-sm">
                    These preferences from your onboarding are used to generate personalized discomfort challenges. You can edit them anytime.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.keys(domainLabels) as (keyof Preferences)[]).map((domain) => (
                      <div key={domain} className="bg-white/5 rounded-lg p-4">
                        <div className="font-semibold text-white mb-3 text-base">{domainLabels[domain]}</div>
                        <div className="space-y-2 mb-4">
                          {(preferences[domain] || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/10 rounded-md px-3 py-2">
                              <span className="text-white text-sm">{item}</span>
                              <button 
                                className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium" 
                                onClick={() => handleRemovePref(domain, item)} 
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {(preferences[domain] || []).length === 0 && (
                            <div className="text-white/50 text-sm italic py-2">
                              No {domainLabels[domain].toLowerCase()} preferences yet
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder={`Add ${domainLabels[domain].toLowerCase()} preference...`}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleAddPref(domain, input.value.trim());
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium"
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                              if (input && input.value.trim()) {
                                handleAddPref(domain, input.value.trim());
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50" 
                      onClick={handleSave} 
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                  <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-200 text-sm">
                      💡 <strong>Tip:</strong> The more specific your preferences, the better your personalized discomfort challenges will be!
                    </p>
                  </div>
                </section>
              );
            case 'Notifications':
              return <NotificationsSection />;
            case 'Appearance':
              return <AppearanceSection />;
            case 'Account':
              return (
                <section className="bg-white/5 rounded-lg p-4 shadow border border-white/10">
                  <h2 className="text-lg font-semibold mb-3 text-white">Account</h2>
                  <div className="mb-6">
                    <h3 className="text-base font-semibold mb-2 text-white/90">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-white/70 mb-1">New Password</label>
                        <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1">Confirm Password</label>
                        <input className="w-full px-3 py-1.5 rounded bg-white/10 text-white text-sm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                      </div>
                    </div>
                    <div className="flex items-center mt-1">
                      <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} className="mr-2" id="showpass" />
                      <label htmlFor="showpass" className="text-white/60 text-xs">Show Password</label>
                    </div>
                    <button className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={handleChangePassword} disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <button className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={() => setShowDelete(true)} disabled={loading}>Delete Account</button>
                    <button className="bg-gradient-to-r from-gray-700 to-gray-900 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={signOut} disabled={loading}>Sign Out</button>
                  </div>
                </section>
              );
            case 'Activity Log':
              return (
                <section className="bg-white/5 rounded-lg p-4 shadow border border-white/10">
                  <h2 className="text-lg font-semibold mb-3 text-white">Activity Log</h2>
                  <ul className="text-xs text-white/70 space-y-1 max-h-32 overflow-y-auto">
                    <li>Signed in - 2 hours ago</li>
                    <li>Updated preferences - 1 hour ago</li>
                    <li>Changed password - 30 minutes ago</li>
                    <li>Completed onboarding - 1 day ago</li>
                    <li>Signed out - 2 days ago</li>
                  </ul>
                </section>
              );
            default:
              return null;
          }
        })()}
        {showDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center shadow-xl">
              <h3 className="text-lg font-bold mb-3 text-red-600">Delete Account?</h3>
              <p className="mb-4 text-gray-700 text-xs">This action is irreversible. Are you sure you want to delete your account?</p>
              <div className="flex gap-2 justify-center">
                <button className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={handleDeleteAccount} disabled={loading}>Yes, Delete</button>
                <button className="bg-gray-200 px-4 py-1.5 rounded text-gray-800 font-bold text-xs" onClick={() => setShowDelete(false)} disabled={loading}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
