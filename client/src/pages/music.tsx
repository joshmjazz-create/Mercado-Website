import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, Play, Pause, Volume2 } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface DriveAlbum {
  id: string;
  title: string;
  artist: string;
  year: string;
  links: {
    spotify?: string;
    applemusic?: string;
    youtube?: string;
  };
  category: string;
  spotifyId: string | null;
  coverImageUrl: string | null;
  audioFileId?: string | null;
  createdTime: string;
}

interface AlbumCategories {
  original: DriveAlbum[];
  featured: DriveAlbum[];
  upcoming: DriveAlbum[];
}

interface SpotifyAlbumImage {
  url: string;
  height: number;
  width: number;
}

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<DriveAlbum | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [previewCompleted, setPreviewCompleted] = useState<Set<string>>(new Set());
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicFolderUrl = "https://drive.google.com/drive/folders/1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6";

  // Load each section independently for better performance
  const { data: originalAlbums, isLoading: originalLoading } = useQuery({
    queryKey: ['/api/drive/music-albums', 'original'],
    queryFn: async (): Promise<DriveAlbum[]> => {
      const response = await fetch('/api/drive/music-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareUrl: musicFolderUrl })
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data: AlbumCategories = await response.json();
      const albums = data.original || [];
      return albums.sort((a, b) => a.title.localeCompare(b.title));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: featuredAlbums, isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/drive/music-albums', 'featured'],
    queryFn: async (): Promise<DriveAlbum[]> => {
      const response = await fetch('/api/drive/music-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareUrl: musicFolderUrl })
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data: AlbumCategories = await response.json();
      const albums = data.featured || [];
      return albums.sort((a, b) => a.title.localeCompare(b.title));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: upcomingAlbums, isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/drive/music-albums', 'upcoming'],
    queryFn: async (): Promise<DriveAlbum[]> => {
      const response = await fetch('/api/drive/music-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareUrl: musicFolderUrl })
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data: AlbumCategories = await response.json();
      const albums = data.upcoming || [];
      return albums.sort((a, b) => a.title.localeCompare(b.title));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleAlbumClick = (album: DriveAlbum) => {
    if (album.category === 'upcoming' && album.audioFileId) {
      // Handle audio preview for upcoming albums
      if (previewCompleted.has(album.audioFileId)) {
        // Reset the completed state for this album to allow new preview
        setPreviewCompleted(prev => {
          const newSet = new Set(prev);
          newSet.delete(album.audioFileId!);
          return newSet;
        });
      }
      handleAudioPreview(album);
    } else {
      // Handle platform selection for released albums
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handleAudioPreview = async (album: DriveAlbum) => {
    if (!album.audioFileId) return;

    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (currentAudio === album.audioFileId && isPlaying) {
        // Stop current preview
        setIsPlaying(false);
        setCurrentAudio(null);
        return;
      }

      // Show loading state
      setLoadingPreview(album.audioFileId);
      
      // Create new audio element with more aggressive loading
      const audio = new Audio();
      audioRef.current = audio;
      setCurrentAudio(album.audioFileId);

      // Set the source with aggressive preloading
      audio.src = `/api/audio/${album.audioFileId}`;
      audio.preload = 'auto'; // Load the entire file
      audio.crossOrigin = 'anonymous';

      // Try multiple events to get duration
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Audio loading timeout - file may be too large'));
        }, 20000); // Extended timeout

        let resolved = false;
        const cleanup = () => {
          audio.removeEventListener('durationchange', onDurationChange);
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          clearTimeout(timeout);
        };

        const tryResolve = () => {
          if (!resolved && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
            resolved = true;
            cleanup();
            console.log('Audio duration detected:', audio.duration);
            resolve(true);
          }
        };

        const onDurationChange = () => {
          console.log('Duration changed:', audio.duration);
          tryResolve();
        };
        const onLoadedMetadata = () => {
          console.log('Metadata loaded, duration:', audio.duration);
          tryResolve();
        };
        const onCanPlay = () => {
          console.log('Can play, duration:', audio.duration);
          tryResolve();
        };
        const onError = (e: Event) => {
          cleanup();
          console.error('Audio load error:', e, 'Audio src:', audio.src, 'Audio error:', audio.error);
          reject(new Error(`Audio load failed: ${audio.error?.message || 'Network or format error'}`));
        };
        
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
        audio.load();
      });

      // Duration should be available now
      const duration = audio.duration;
      console.log('Final audio duration:', duration);
      
      if (!duration || !isFinite(duration) || duration <= 0) {
        throw new Error('Could not get audio duration - file may be corrupted or streaming issue');
      }
      
      // Start exactly at 1/3 mark, but ensure we don't start too close to the end
      const startTime = Math.min(duration / 3, duration - 17); // Leave at least 17 seconds
      const previewDuration = 15; // Exactly 15 seconds
      console.log('Start time:', startTime, 'Preview duration:', previewDuration, 'Total duration:', duration);

      // Set start time
      audio.currentTime = startTime;

      // Set up fade in/out effects
      audio.volume = 0;
      setIsPlaying(true);
      setLoadingPreview(null); // Clear loading state
      
      // Start playing
      await audio.play();

      // Fade in over 2 seconds (0 to 0.7 volume)
      const fadeInInterval = setInterval(() => {
        if (audio.volume < 0.7) {
          audio.volume = Math.min(0.7, audio.volume + 0.035);
        } else {
          clearInterval(fadeInInterval);
        }
      }, 100);

      // Set up fade out 2 seconds before the end
      const fadeOutTimer = setTimeout(() => {
        if (audioRef.current === audio) {
          const fadeOutInterval = setInterval(() => {
            if (audio.volume > 0.035) {
              audio.volume = Math.max(0, audio.volume - 0.035);
            } else {
              clearInterval(fadeOutInterval);
              audio.pause();
              setIsPlaying(false);
              setCurrentAudio(null);
              audioRef.current = null;
              // Mark this preview as completed
              if (album.audioFileId) {
                setPreviewCompleted(prev => new Set(prev).add(album.audioFileId!));
              }
            }
          }, 100);
        }
      }, (previewDuration - 2) * 1000);

      // Stop exactly after preview duration
      const stopTimer = setTimeout(() => {
        if (audioRef.current === audio) {
          audio.pause();
          setIsPlaying(false);
          setCurrentAudio(null);
          audioRef.current = null;
          // Mark this preview as completed
          if (album.audioFileId) {
            setPreviewCompleted(prev => new Set(prev).add(album.audioFileId!));
          }
        }
      }, previewDuration * 1000);

      // Handle audio end - reset to allow new preview
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        audioRef.current = null;
        // Mark this preview as completed
        if (album.audioFileId) {
          setPreviewCompleted(prev => new Set(prev).add(album.audioFileId!));
        }
      });

    } catch (error) {
      console.error('Error playing audio preview:', error);
      console.error('Album data:', album);
      console.error('Audio URL:', `/api/audio/${album.audioFileId}`);
      setIsPlaying(false);
      setCurrentAudio(null);
      setLoadingPreview(null); // Clear loading state on error
      audioRef.current = null;
    }
  };

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlatformClick = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return <FaSpotify className="h-6 w-6" />;
      case 'applemusic':
        return <FaApple className="h-6 w-6" />;
      case 'youtube':
        return <FaYoutube className="h-6 w-6" />;
      default:
        return <ExternalLink className="h-6 w-6" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return 'Spotify';
      case 'applemusic':
        return 'Apple Music';
      case 'youtube':
        return 'YouTube';
      default:
        return platform;
    }
  };

  const renderAlbumGrid = (albums: DriveAlbum[], title: string) => {
    if (!albums || albums.length === 0) {
      return null;
    }

    return (
      <div className="mb-12 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
        {title !== 'My Music' && (
          <h3 className="text-lg font-semibold text-gray-500 mb-6 underline text-left">
            {title}
          </h3>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album, index) => (
            <div
              key={album.id}
              className="cursor-pointer group transition-all duration-500 ease-out hover:scale-105 opacity-0 translate-y-4 animate-in"
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: '600ms',
                animationFillMode: 'forwards'
              }}
              onClick={() => handleAlbumClick(album)}
            >
              <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                {album.coverImageUrl ? (
                  <img
                    src={album.coverImageUrl}
                    alt={`${album.title} cover`}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    onError={(e) => {
                      console.log('Image load error for:', album.coverImageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <div className="text-xs font-semibold">{album.title}</div>
                      <div className="text-xs opacity-75">{album.artist}</div>
                    </div>
                  </div>
                )}
                
                {/* Audio preview overlay for upcoming albums */}
                {album.category === 'upcoming' && album.audioFileId && !previewCompleted.has(album.audioFileId) && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {loadingPreview === album.audioFileId ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : currentAudio === album.audioFileId ? (
                      isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : null
                    ) : (
                      <Play className="h-8 w-8 text-white ml-1" />
                    )}
                  </div>
                )}
                
                {/* Platform links icon for released albums */}
                {album.category !== 'upcoming' && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-sm text-center truncate">
                {album.title}
                {currentAudio === album.audioFileId && isPlaying && (
                  <span className="ml-2 text-purple-600">♪</span>
                )}
              </h4>
              <p className="text-xs text-gray-600 text-center truncate">
                {album.artist}
              </p>
              {album.year && (
                <p className="text-xs text-gray-500 text-center">
                  {album.year}
                </p>
              )}
              
              {/* Preview indicator for upcoming albums - only show if audio file exists */}
              {album.category === 'upcoming' && album.audioFileId && (
                <p className="text-purple-600 text-xs text-center mt-1 font-medium">
                  Preview Available
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading component for individual sections
  const LoadingSection = ({ title }: { title?: string }) => (
    <div className="mb-12 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
      {title && title !== 'My Music' && (
        <h3 className="text-lg font-semibold text-gray-500 mb-6 underline text-left">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-800 mb-4">Music</h1>
          <div className="w-32 h-1 bg-purple-800 mx-auto"></div>
        </div>

        {/* My Music Section */}
        {originalLoading ? (
          <LoadingSection />
        ) : originalAlbums && originalAlbums.length > 0 ? (
          renderAlbumGrid(originalAlbums, "My Music")
        ) : null}

        {/* Featured On Section */}
        {featuredLoading ? (
          <LoadingSection title="Featured On" />
        ) : featuredAlbums && featuredAlbums.length > 0 ? (
          renderAlbumGrid(featuredAlbums, "Featured On")
        ) : null}

        {/* Upcoming Section */}
        {upcomingLoading ? (
          <LoadingSection title="Upcoming" />
        ) : upcomingAlbums && upcomingAlbums.length > 0 ? (
          renderAlbumGrid(upcomingAlbums, "Upcoming")
        ) : null}

        {/* Platform Selection Dialog */}
        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">
              {selectedAlbum ? `Listen to ${selectedAlbum.title}` : 'Select Platform'}
            </DialogTitle>
            {selectedAlbum && (
              <div className="text-center p-6">
                <div className="aspect-square w-32 mx-auto mb-4 rounded-lg overflow-hidden">
                  {selectedAlbum.coverImageUrl ? (
                    <img
                      src={selectedAlbum.coverImageUrl}
                      alt={`${selectedAlbum.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{selectedAlbum.title}</h3>
                <p className="text-gray-600 mb-6">{selectedAlbum.artist}</p>
                
                <div className="space-y-3">
                  {Object.entries(selectedAlbum.links).map(([platform, url]) => (
                    <Button
                      key={platform}
                      onClick={() => handlePlatformClick(url)}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3 h-12"
                      disabled={!url}
                    >
                      {getPlatformIcon(platform)}
                      <span>{url ? `Listen on ${getPlatformName(platform)}` : `Not available on ${getPlatformName(platform)}`}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}