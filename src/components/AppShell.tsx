"use client";

import { useState, useEffect } from "react";
import { Music2, X, LogIn, UserPlus, PanelLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar"; 
import YouTubePlayer from "@/components/YouTubePlayer";
import MediaSession from "@/components/MediaSession";
import { usePathname, useRouter } from "next/navigation";
import { InstallPWA } from "@/components/InstallPWA";
import SEOHead from "@/components/SEOHead";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { setClerkUserId } from "@/lib/storage";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user?.id) {
      setClerkUserId(user.id);
    }
  }, [isLoaded, user?.id]);

  const handleNavigate = (view: string, id?: string) => {
    setIsSidebarOpen(false); 
    if (view === "playlist" && id) {
      router.push(`/playlist/${id}`);
    } else {
      router.push(`/${view}`);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col">
      <SEOHead />
      <YouTubePlayer />
      <MediaSession />

      <header className="h-16 flex items-center justify-between px-6 bg-black border-b border-white/10 z-[60] shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 group active:scale-95 transition-transform md:hidden"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSidebarOpen ? 'bg-white text-black' : 'bg-primary text-primary-foreground'}`}>
              {isSidebarOpen ? <X className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </div>
            <span className="font-bold text-xl tracking-tighter">vikkmore</span>
          </button>
          
          <div className="hidden md:block">
            {/* Empty space or breadcrumbs can go here if needed */}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 border border-white/10"
                }
              }}
            />
          </Show>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          activeView={pathname} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={handleNavigate} 
        />

        <main 
          key={pathname}
          className="flex-1 overflow-y-auto bg-background relative pb-24 md:pb-0 scrollbar-thin animate-page-enter"
        >
          {children}
          
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </main>
      </div>

      <PlayerBar />
      <InstallPWA />
    </div>
  );
}
