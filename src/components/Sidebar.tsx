import { Home, Search, Heart, Plus, Settings, Import, Music, Download } from "lucide-react";
import { getPlaylists, type Playlist } from "@/lib/storage";
import { useState, useEffect } from "react";
import ImportPlaylistModal from "@/components/ImportPlaylistModal";
import CreatePlaylistModal from "@/components/CreatePlaylistModal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string, playlistId?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ activeView, onNavigate, isOpen, onClose }: SidebarProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const refresh = () => setPlaylists(getPlaylists());
  useEffect(refresh, [activeView]);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      <aside className={`
        /* Mobile: Top-down Drawer */
        fixed top-16 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl
        border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? "max-h-[80vh] opacity-100 visible" : "max-h-0 opacity-0 invisible md:visible"}
        
        /* Desktop: Standard Sidebar */
        md:relative md:top-0 md:max-h-full md:w-64 md:opacity-100 md:border-r md:border-b-0
      `}>
        <div className="p-4 flex flex-col h-full max-w-2xl mx-auto md:max-w-none">
          
          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            <SidebarItem 
              icon={Home} 
              label="Home" 
              active={activeView === "home"} 
              onClick={() => onNavigate("home")} 
            />
            <SidebarItem 
              icon={Search} 
              label="Search" 
              active={activeView === "search"} 
              onClick={() => onNavigate("search")} 
            />
            <SidebarItem 
              icon={Settings} 
              label="API Settings" 
              active={activeView === "settings"} 
              onClick={() => onNavigate("settings")} 
            />
            
            {/* Install App Button - Only show if not installed and prompt is available */}
            {!isInstalled && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-primary/30 to-primary/20 text-primary hover:from-primary/40 hover:to-primary/30 border border-primary/40 hover:border-primary/60 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <Download className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Install App</div>
                  <div className="text-xs text-primary/80">Add to Home Screen</div>
                </div>
              </button>
            )}
          </nav>

          {/* Library Section */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-2 px-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Library</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowImport(true)} className="p-1 hover:text-white transition-colors">
                  <Import className="w-4 h-4" />
                </button>
                <button onClick={() => setShowCreate(true)} className="p-1 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <SidebarItem 
              icon={Heart} 
              label="Liked Songs" 
              active={activeView === "liked"} 
              onClick={() => onNavigate("liked")} 
            />

            <div className="mt-2 space-y-1">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => onNavigate("playlist", pl.id)}
                  className={`w-full px-3 py-2 rounded-md text-sm truncate flex items-center gap-3 transition-all ${
                    activeView === `playlist-${pl.id}`
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  <Music className="w-4 h-4 shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <ImportPlaylistModal open={showImport} onClose={() => setShowImport(false)} onImported={refresh} />
      <CreatePlaylistModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refresh} />
    </>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
      active ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
    }`}
  >
    <Icon className="w-5 h-5 shrink-0" />
    <span>{label}</span>
  </button>
);

export default Sidebar;