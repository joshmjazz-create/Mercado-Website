import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, Play, Pause, Volume2 } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [selectedCategory, setSelectedCategory] = useState<'original' | 'featured' | 'upcoming'>('original');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicFolderUrl = "https://drive.google.com/drive/folders/1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6";

  // Use static content for reliable deployment - but keep API structure for future restoration
  const staticAlbums: DriveAlbum[] = [];
  
  const { data: originalAlbums = [], isLoading: originalLoading } = useQuery({
    queryKey: ['/api/drive/music-albums', 'original'],
    queryFn: async (): Promise<DriveAlbum[]> => {
      // Static deployment - return empty for now
      return staticAlbums.filter(album => album.category === 'original');
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: featuredAlbums = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/drive/music-albums', 'featured'],
    queryFn: async (): Promise<DriveAlbum[]> => {
      // Static deployment - return empty for now
      return staticAlbums.filter(album => album.category === 'featured');
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: upcomingAlbums = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/drive/music-albums', 'upcoming'],
    queryFn: async (): Promise<DriveAlbum[]> => {
      // Static deployment - return empty for now
      return staticAlbums.filter(album => album.category === 'upcoming');
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const handleAlbumClick = (album: DriveAlbum) => {
    setSelectedAlbum(album);
    setShowPlatforms(true);
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  const playPreview = async (audioFileId: string, albumTitle: string) => {
    if (isPlaying && currentAudio === audioFileId) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    setLoadingPreview(audioFileId);
    try {
      const response = await fetch(`/api/image/${audioFileId}`);
      if (!response.ok) throw new Error('Audio not available');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setCurrentAudio(audioFileId);
      
      const duration = await new Promise<number>((resolve) => {
        audio.addEventListener('loadedmetadata', () => resolve(audio.duration));
      });
      
      const startTime = Math.max(0, duration / 3);
      audio.currentTime = startTime;
      
      audio.volume = 0;
      await audio.play();
      setIsPlaying(true);
      
      const fadeInDuration = 1000;
      const fadeInSteps = 20;
      const fadeInInterval = fadeInDuration / fadeInSteps;
      let step = 0;
      
      const fadeIn = setInterval(() => {
        step++;
        audio.volume = Math.min(1, step / fadeInSteps);
        if (step >= fadeInSteps) clearInterval(fadeIn);
      }, fadeInInterval);
      
      const previewDuration = 15000;
      setTimeout(() => {
        const fadeOutDuration = 2000;
        const fadeOutSteps = 20;
        const fadeOutInterval = fadeOutDuration / fadeOutSteps;
        let step = fadeOutSteps;
        
        const fadeOut = setInterval(() => {
          step--;
          audio.volume = Math.max(0, step / fadeOutSteps);
          if (step <= 0) {
            clearInterval(fadeOut);
            audio.pause();
            setIsPlaying(false);
            setCurrentAudio(null);
            setPreviewCompleted(prev => new Set([...Array.from(prev), audioFileId]));
            URL.revokeObjectURL(audioUrl);
          }
        }, fadeOutInterval);
      }, previewDuration - 2000);
      
    } catch (error) {
      console.error('Error playing preview:', error);
    } finally {
      setLoadingPreview(null);
    }
  };

  const getCurrentAlbums = () => {
    switch (selectedCategory) {
      case 'featured': return featuredAlbums;
      case 'upcoming': return upcomingAlbums;
      default: return originalAlbums;
    }
  };

  const isLoading = originalLoading || featuredLoading || upcomingLoading;

  return (
    <section className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Music</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
          {/* Category Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-100 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('original')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    selectedCategory === 'original'
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  My Music
                  {originalAlbums.length > 0 && (
                    <span className="ml-2 text-sm opacity-75">({originalAlbums.length})</span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedCategory('featured')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    selectedCategory === 'featured'
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Featured On
                  {featuredAlbums.length > 0 && (
                    <span className="ml-2 text-sm opacity-75">({featuredAlbums.length})</span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedCategory('upcoming')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    selectedCategory === 'upcoming'
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upcoming
                  {upcomingAlbums.length > 0 && (
                    <span className="ml-2 text-sm opacity-75">({upcomingAlbums.length})</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-800" />
              </div>
            ) : (
              <>
                {getCurrentAlbums().length === 0 ? (
                  <div className="text-center py-20">
                    <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                      <h3 className="text-xl text-gray-800 mb-4">
                        {selectedCategory === 'original' && 'No Original Music'}
                        {selectedCategory === 'featured' && 'No Featured Albums'}
                        {selectedCategory === 'upcoming' && 'No Upcoming Releases'}
                      </h3>
                      <p className="text-gray-600">
                        Albums will appear here when available.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getCurrentAlbums().map((album, index) => (
                      <div
                        key={album.id}
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105 opacity-0 translate-y-4 animate-in"
                        style={{ animationDelay: `${600 + (index * 100)}ms` }}
                        onClick={() => handleAlbumClick(album)}
                      >
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                          {/* Album Cover */}
                          <div className="relative aspect-square bg-gray-200">
                            {album.coverImageUrl ? (
                              <img
                                src={album.coverImageUrl}
                                alt={album.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-400">
                                <span className="text-white text-lg font-bold">
                                  {album.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            
                            {/* Preview Button for Upcoming Albums */}
                            {selectedCategory === 'upcoming' && album.audioFileId && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPreview(album.audioFileId!, album.title);
                                  }}
                                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-purple-800 p-3 rounded-full transition-all duration-200"
                                  disabled={loadingPreview === album.audioFileId}
                                >
                                  {loadingPreview === album.audioFileId ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                  ) : isPlaying && currentAudio === album.audioFileId ? (
                                    <Pause className="w-6 h-6" />
                                  ) : previewCompleted.has(album.audioFileId!) ? (
                                    <Volume2 className="w-6 h-6" />
                                  ) : (
                                    <Play className="w-6 h-6" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Album Info */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-purple-800 transition-colors duration-200">
                              {album.title}
                            </h3>
                            <p className="text-gray-600 mb-1">{album.artist}</p>
                            <p className="text-sm text-gray-500">{album.year}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Platform Selection Dialog */}
        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="bg-white border-purple-800">
            <DialogTitle className="text-gray-800 text-center text-xl mb-6">
              {selectedAlbum?.title}
            </DialogTitle>
            <div className="grid grid-cols-1 gap-4">
              {selectedAlbum?.links.spotify && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.links.spotify!)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-4 h-auto"
                >
                  <FaSpotify className="mr-3 text-xl" />
                  <span>Listen on Spotify</span>
                  <ExternalLink className="ml-auto w-4 h-4" />
                </Button>
              )}
              
              {selectedAlbum?.links.applemusic && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.links.applemusic!)}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white p-4 h-auto"
                >
                  <FaApple className="mr-3 text-xl" />
                  <span>Listen on Apple Music</span>
                  <ExternalLink className="ml-auto w-4 h-4" />
                </Button>
              )}
              
              {selectedAlbum?.links.youtube && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.links.youtube!)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-4 h-auto"
                >
                  <FaYoutube className="mr-3 text-xl" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="ml-auto w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}