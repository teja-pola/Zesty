import { useState } from 'react';
import toast from 'react-hot-toast';

export function NotificationsSection() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Notification preferences saved!');
      setLoading(false);
    }, 800);
  };

  return (
    <section className="bg-white/5 rounded-lg p-4 shadow border border-white/10 text-sm">
      <h2 className="text-lg font-semibold mb-3 text-white">Notifications</h2>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(v => !v)} />
          <span className="text-white/80">Email notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={pushNotif} onChange={() => setPushNotif(v => !v)} />
          <span className="text-white/80">Push notifications</span>
        </label>
      </div>
      <button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 rounded text-white font-bold text-xs" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Notifications'}
      </button>
    </section>
  );
}
