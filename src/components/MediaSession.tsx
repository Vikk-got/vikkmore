import { useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";

const MediaSession = () => {
  const { currentSong, playerRef, nextSong, prevSong, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    // Only initialize if Media Session API is available
    if (!('mediaSession' in navigator)) {
      console.log('Media Session API not supported');
      return;
    }

    // Update media session metadata when current song changes
    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: 'Vikkmore Music Player',
        artwork: [
          { src: currentSong.thumbnail, sizes: '96x96', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '128x128', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '192x192', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '256x256', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '384x384', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      console.log('Media session updated:', currentSong.title);
    }

    // Set up action handlers
    const setActionHandlers = () => {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          if (playerRef.current) {
            playerRef.current.playVideo?.();
            togglePlay();
          }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          if (playerRef.current) {
            playerRef.current.pauseVideo?.();
            togglePlay();
          }
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          nextSong();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
          prevSong();
        });

        // Handle seek actions
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          // Seek backward 10 seconds by default
          const seekOffset = details?.seekOffset || 10;
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime?.() || 0;
            playerRef.current.seekTo?.(Math.max(0, currentTime - seekOffset), true);
          }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          // Seek forward 10 seconds by default
          const seekOffset = details?.seekOffset || 10;
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime?.() || 0;
            const duration = playerRef.current.getDuration?.() || 0;
            playerRef.current.seekTo?.(Math.min(duration, currentTime + seekOffset), true);
          }
        });

        console.log('Media session action handlers registered');
      } catch (error) {
        console.warn('Media session action handlers not supported:', error);
      }
    };

    setActionHandlers();

    // Cleanup function
    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch (error) {
        console.warn('Error cleaning up media session handlers:', error);
      }
    };
  }, [currentSong, nextSong, prevSong, togglePlay, playerRef]);

  // Update playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // This component doesn't render anything
  return null;
};

export default MediaSession;