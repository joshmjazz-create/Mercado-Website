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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicFolderUrl = "https://drive.google.com/drive/folders/1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6";

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/drive/music-albums'],
    queryFn: async (): Promise<AlbumCategories> => {
      const response = await fetch('/api/drive/music-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareUrl: musicFolderUrl })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch albums: ${response.status}`);
      }
      
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const handleAlbumClick = (album: DriveAlbum) => {
    if (album.category === 'upcoming' && album.audioFileId) {
      // Handle audio preview for upcoming albums
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

      // Create new audio element
      const audio = new Audio();
      audioRef.current = audio;
      setCurrentAudio(album.audioFileId);

      // Set the source and load
      audio.src = `/api/audio/${album.audioFileId}`;
      audio.preload = 'metadata';

      // Wait for metadata to be loaded so we get the real duration
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          audio.removeEventListener('error', onError);
          reject(new Error('Audio metadata loading timeout'));
        }, 10000);

        const onLoadedMetadata = () => {
          clearTimeout(timeout);
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          audio.removeEventListener('error', onError);
          resolve(true);
        };
        const onError = (e: Event) => {
          clearTimeout(timeout);
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          audio.removeEventListener('error', onError);
          console.error('Audio load error:', e, 'Audio src:', audio.src, 'Audio error:', audio.error);
          reject(new Error(`Audio load failed: ${audio.error?.message || 'Network or format error'}`));
        };
        
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('error', onError);
      });

      // Now we should have the real duration
      const duration = audio.duration;
      console.log('Audio duration:', duration);
      
      if (!duration || !isFinite(duration) || duration <= 0) {
        throw new Error('Could not get audio duration');
      }
      
      // Start exactly at 1/3 mark
      const startTime = duration / 3;
      const previewDuration = 10; // Exactly 10 seconds
      console.log('Start time:', startTime, 'Preview duration:', previewDuration);

      // Set start time
      audio.currentTime = startTime;

      // Set up fade in/out effects
      audio.volume = 0;
      setIsPlaying(true);
      
      // Start playing
      await audio.play();

      // Fade in over 1 second (0 to 0.7 volume)
      const fadeInInterval = setInterval(() => {
        if (audio.volume < 0.7) {
          audio.volume = Math.min(0.7, audio.volume + 0.07);
        } else {
          clearInterval(fadeInInterval);
        }
      }, 100);

      // Set up fade out 1 second before the end
      const fadeOutTimer = setTimeout(() => {
        if (audioRef.current === audio) {
          const fadeOutInterval = setInterval(() => {
            if (audio.volume > 0.05) {
              audio.volume = Math.max(0, audio.volume - 0.07);
            } else {
              clearInterval(fadeOutInterval);
              audio.pause();
              setIsPlaying(false);
              setCurrentAudio(null);
              audioRef.current = null;
            }
          }, 100);
        }
      }, (previewDuration - 1) * 1000);

      // Stop exactly after preview duration
      const stopTimer = setTimeout(() => {
        if (audioRef.current === audio) {
          audio.pause();
          setIsPlaying(false);
          setCurrentAudio(null);
          audioRef.current = null;
        }
      }, previewDuration * 1000);

      // Handle audio end
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        audioRef.current = null;
      });

    } catch (error) {
      console.error('Error playing audio preview:', error);
      console.error('Album data:', album);
      console.error('Audio URL:', `/api/audio/${album.audioFileId}`);
      setIsPlaying(false);
      setCurrentAudio(null);
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
        <h3 className="text-lg font-semibold text-purple-800 mb-6 underline text-left">
          {title}
        </h3>
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
                {album.category === 'upcoming' && album.audioFileId && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {currentAudio === album.audioFileId && isPlaying ? (
                      <Pause className="h-8 w-8 text-white" />
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
              
              {/* Preview indicator for upcoming albums */}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading music catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load music catalog</p>
          <p className="text-gray-600 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-800 mb-4">Music</h1>
          <div className="w-32 h-1 bg-purple-800 mx-auto"></div>
        </div>

        {categories && categories.original && renderAlbumGrid(categories.original, "My Music")}
        {categories && categories.featured && renderAlbumGrid(categories.featured, "Featured On")}
        {categories && categories.upcoming && renderAlbumGrid(categories.upcoming, "Upcoming")}

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