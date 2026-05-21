"use client";

import { Home, Search, Heart, Plus, Settings, Import, Music, Download, User, LogOut, Info, Mail, Menu, PanelLeft } from "lucide-react";
import { Show, SignOutButton } from "@clerk/nextjs";
import { getPlaylists, subscribeToLibraryChanges, type Playlist } from "@/lib/storage";
import { useState, useEffect } from "react";
import ImportPlaylistModal from "@/components/ImportPlaylistModal";
import CreatePlaylistModal from "@/components/CreatePlaylistModal";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      const nextPlaylists = await getPlaylists();
      if (mounted) setPlaylists(nextPlaylists);
    };

    void refresh();
    const unsubscribe = subscribeToLibraryChanges(() => {
      void refresh();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [activeView]);

  useEffect(() => {
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

  useEffect(() => {
    // Prefetch all major client pages for instant page switching
    router.prefetch("/home");
    router.prefetch("/search");
    router.prefetch("/liked");
    router.prefetch("/profile");
    router.prefetch("/settings");
    router.prefetch("/about");
  }, [router]);

  useEffect(() => {
    playlists.forEach((pl) => {
      router.prefetch(`/playlist/${pl.id}`);
    });
  }, [playlists, router]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <>
      <aside className={`
        /* Mobile: Top-down Drawer */
        fixed top-16 left-0 right-0 z-50 bg-black/40 backdrop-blur-3xl
        border-b border-white/5 transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? "max-h-[80vh] opacity-100 visible" : "max-h-0 opacity-0 invisible md:visible"}
        
        /* Desktop: Standard Sidebar */
        md:relative md:top-0 md:h-full md:max-h-none md:w-[260px] md:opacity-100 md:visible md:pointer-events-auto md:border-r md:border-white/5 md:bg-white/[0.02]
      `}>
        <div className="p-5 flex flex-col h-full max-w-2xl mx-auto md:max-w-none">
          {/* Logo - Desktop Only */}
          <div className="hidden md:flex items-center gap-3 px-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <PanelLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">vikkmore</span>
          </div>

          {/* Navigation Section */}
          <div className="space-y-6 flex-1 overflow-y-auto scrollbar-none">
            <section>
              <h2 className="px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">Explore</h2>
              <div className="space-y-1">
                <SidebarItem 
                  icon={Home} 
                  label="Listen Now" 
                  active={activeView === "/home"} 
                  onClick={() => onNavigate("home")} 
                />
                <SidebarItem 
                  icon={Search} 
                  label="Search" 
                  active={activeView === "/search"} 
                  onClick={() => onNavigate("search")} 
                />
                <SidebarItem 
                  icon={User} 
                  label="Profile" 
                  active={activeView === "/profile"} 
                  onClick={() => onNavigate("profile")} 
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Library</h2>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setShowImport(true)} className="p-1 text-muted-foreground/40 hover:text-white transition-colors" title="Import">
                    <Import className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowCreate(true)} className="p-1 text-muted-foreground/40 hover:text-white transition-colors" title="Create">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <SidebarItem 
                  icon={Heart} 
                  label="Liked Songs" 
                  active={activeView === "/liked"} 
                  onClick={() => onNavigate("liked")} 
                />
                <div className="pt-2 space-y-1">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => onNavigate("playlist", pl.id)}
                      className={`w-full px-4 py-2 rounded-xl text-sm truncate flex items-center gap-3 transition-all duration-200 group ${
                        activeView === `/playlist/${pl.id}`
                          ? "bg-primary/10 text-primary font-semibold shadow-inner"
                          : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <Music className={`w-4 h-4 shrink-0 ${activeView === `/playlist/${pl.id}` ? "text-primary" : "text-muted-foreground/40 group-hover:text-white/60"}`} />
                      <span className="truncate">{pl.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">Settings</h2>
              <div className="space-y-1">
                <SidebarItem 
                  icon={Settings} 
                  label="Settings" 
                  active={activeView === "/settings"} 
                  onClick={() => onNavigate("settings")} 
                />
                <SidebarItem 
                  icon={Info} 
                  label="About" 
                  active={activeView === "/about"} 
                  onClick={() => onNavigate("about")} 
                />
                
                {!isInstalled && deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-2xl text-sm font-medium transition-all bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Install App</span>
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="px-4 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/30 font-medium tracking-tight">
                © {new Date().getFullYear()} vikkmore
              </p>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <ImportPlaylistModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => void getPlaylists().then(setPlaylists)}
      />
      <CreatePlaylistModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => void getPlaylists().then(setPlaylists)}
      />
    </>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
    }`}
  >
    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground/40 group-hover:text-white/60"}`} />
    <span>{label}</span>
  </button>
);

export default Sidebar;
