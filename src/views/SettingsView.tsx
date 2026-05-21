import { useState, useEffect } from "react";
import { Server, Sparkles, ShieldCheck, Sliders, Trash2, Check } from "lucide-react";
import { getApiKey, clearRecentSongs } from "@/lib/storage";

const SettingsView = () => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    getApiKey().then((k) => {
      setHasKey(!!k);
      setLoading(false);
    });
  }, []);

  const handleClearHistory = async () => {
    await clearRecentSongs();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your application preferences and review system status.
        </p>
      </div>

      {/* SYSTEM STATUS CARD */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-card-foreground">System Status</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* YouTube API Status */}
          <div className="bg-secondary/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-28 transition-all hover:bg-secondary/60">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">YouTube Data API</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full ${hasKey ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
              <span className="text-sm font-bold text-foreground">
                {loading ? "Checking..." : hasKey ? "Active (Server Key)" : "Key Configuration Needed"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {hasKey ? "Shared server credentials loaded securely." : "Set YOUTUBE_API_KEY env variable."}
            </p>
          </div>

          {/* Theme Status */}
          <div className="bg-secondary/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-28 transition-all hover:bg-secondary/60">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Application Theme</span>
            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-foreground">Sonic Blue Flame</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Electric cyan-blue fire gradient layout active.
            </p>
          </div>
        </div>
      </div>

      {/* PREFERENCES CARD */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-card-foreground">Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-border">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Listening History</p>
              <p className="text-xs text-muted-foreground">Clear your recently played songs from this browser.</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-5 py-2 bg-secondary text-secondary-foreground rounded-full text-xs font-bold hover:bg-destructive hover:text-white transition-all flex items-center gap-2"
            >
              {cleared ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Cleared</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Audio Stream Quality</p>
              <p className="text-xs text-muted-foreground">Default stream quality optimized for performance.</p>
            </div>
            <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold">
              High (160kbps AAC)
            </span>
          </div>
        </div>
      </div>

      {/* SECURITY INFO CARD */}
      <div className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border border-primary/10 rounded-2xl p-6 flex gap-4">
        <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">Secure Credentials System</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            vikkmore has been upgraded to run entirely on secure server-side environment variables. 
            Individual users are no longer required to create and manage their own Google Cloud API keys, 
            protecting your privacy and simplifying setup.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
