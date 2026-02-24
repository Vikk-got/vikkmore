import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-6 md:w-96 bg-gradient-to-br from-background to-background/90 border border-primary/20 rounded-xl shadow-2xl p-5 z-50 backdrop-blur-xl">
      <button
        onClick={() => setShowInstall(false)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">Install Vikkmore</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Install this app to your home screen for quick access and an app-like experience
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall} 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              Install Now
            </Button>
            <Button 
              onClick={() => setShowInstall(false)}
              variant="outline"
              className="border-primary/30 hover:bg-primary/5"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
