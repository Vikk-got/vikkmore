import { useEffect, useRef, useCallback } from "react";
import { usePlayer } from "@/context/PlayerContext";

declare global {
  interface Window { 
    onYouTubeIframeAPIReady?: () => void; 
    YT?: any;
  }
}

const YouTubePlayer = () => {
  const { currentSong, volume, playerRef, nextSong, isPlaying } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiLoaded = useRef(false);
  const playerReady = useRef(false);
  const wakeLock = useRef<any>(null);

  // Request wake lock to prevent screen from sleeping
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake lock acquired');
      } catch (err) {
        console.error('Wake lock request failed:', err);
      }
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLock.current) {
      wakeLock.current.release();
      wakeLock.current = null;
      console.log('Wake lock released');
    }
  }, []);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "0",
      width: "0",
      playerVars: { 
        autoplay: 1, 
        controls: 0, 
        disablekb: 1, 
        fs: 0, 
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          playerReady.current = true;
          playerRef.current?.setVolume(volume);
          if (currentSong) playerRef.current?.loadVideoById(currentSong.id);
        },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            requestWakeLock();
          } else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) {
            releaseWakeLock();
          }
          
          if (e.data === window.YT.PlayerState.ENDED) {
            nextSong();
          }
        },
      },
    });
  }, [volume, currentSong, requestWakeLock, releaseWakeLock, nextSong]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      apiLoaded.current = true;
      initPlayer();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded.current = true;
      initPlayer();
    };
  }, [initPlayer]);

  useEffect(() => {
    if (!currentSong || !playerRef.current || !playerReady.current) return;
    playerRef.current.loadVideoById(currentSong.id);
  }, [currentSong?.id]);

  useEffect(() => {
    playerRef.current?.setVolume?.(volume);
  }, [volume]);

  // Handle visibility change to maintain playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && playerRef.current) {
        console.log('App moved to background, music continues');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, playerRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return <div ref={containerRef} className="absolute w-0 h-0 overflow-hidden" />;
};

export default YouTubePlayer;
