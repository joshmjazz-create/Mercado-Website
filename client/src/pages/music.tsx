import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Play, Pause } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";

interface Album {
  id: string;
  title: string;
  artist: string;
  description?: string;
  coverImageUrl: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  releaseDate?: string;
  category: string;
  audioPreviewUrl?: string;
  createdAt: Date;
}

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ['/api/albums'],
  });

  const handleAlbumClick = (album: Album) => {
    if (album.category === "upcoming" && album.audioPreviewUrl) {
      handleAudioPreview(album);
    } else {
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handleAudioPreview = (album: Album) => {
    if (currentlyPlaying === album.id) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentlyPlaying(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Start new audio
    const audio = new Audio(album.audioPreviewUrl);
    audioRef.current = audio;
    setCurrentlyPlaying(album.id);
    
    // Fade in
    audio.volume = 0;
    audio.play();
    
    const fadeIn = setInterval(() => {
      if (audio.volume < 1) {
        audio.volume = Math.min(audio.volume + 0.1, 1);
      } else {
        clearInterval(fadeIn);
      }
    }, 100);

    // Auto stop after 10 seconds with fade out
    setTimeout(() => {
      const fadeOut = setInterval(() => {
        if (audio.volume > 0) {
          audio.volume = Math.max(audio.volume - 0.1, 0);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          setCurrentlyPlaying(null);
        }
      }, 100);
    }, 9000); // Start fade out at 9 seconds for 1 second fade
  };

  const openPlatform = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
    setShowPlatforms(false);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const originalAlbums = albums.filter(album => album.category === "original");
  const featuredAlbums = albums.filter(album => album.category === "featured");
  const upcomingAlbums = albums.filter(album => album.category === "upcoming");

  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Music</h1>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Original Music Section */}
          <div className="mb-16">
            {originalAlbums.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {originalAlbums.map((album) => (
                  <div key={album.id} className="relative group">
                    <div 
                      className="cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-purple-800">{album.title}</h3>
                      <p className="text-sm text-gray-600">{album.artist}</p>
                      {album.releaseDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(album.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured On Section */}
          {featuredAlbums.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">Featured On</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredAlbums.map((album) => (
                  <div key={album.id} className="relative group">
                    <div 
                      className="cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-purple-800">{album.title}</h3>
                      <p className="text-sm text-gray-600">{album.artist}</p>
                      {album.releaseDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(album.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Albums Section */}
          {upcomingAlbums.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">Upcoming</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {upcomingAlbums.map((album) => (
                  <div key={album.id} className="relative group">
                    <div 
                      className="cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg opacity-90"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        {currentlyPlaying === album.id ? (
                          <Pause className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      {currentlyPlaying === album.id && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                          Playing
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-purple-800">{album.title}</h3>
                      <p className="text-sm text-gray-600">{album.artist}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Coming {album.releaseDate && new Date(album.releaseDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Selection Modal */}
          {showPlatforms && selectedAlbum && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPlatforms(false)}
            >
              <div 
                className="bg-white rounded-lg p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-center mb-4">Listen to {selectedAlbum.title}</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => openPlatform(selectedAlbum.spotifyUrl)}
                    disabled={!selectedAlbum.spotifyUrl}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FaSpotify className="w-6 h-6 text-[#1DB954]" />
                      <span>Spotify</span>
                    </div>
                    {!selectedAlbum.spotifyUrl && <span className="text-sm text-gray-500">Not available</span>}
                  </button>
                  
                  <button
                    onClick={() => openPlatform(selectedAlbum.appleMusicUrl)}
                    disabled={!selectedAlbum.appleMusicUrl}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FaApple className="w-6 h-6 text-[#000000]" />
                      <span>Apple Music</span>
                    </div>
                    {!selectedAlbum.appleMusicUrl && <span className="text-sm text-gray-500">Not available</span>}
                  </button>
                  
                  <button
                    onClick={() => openPlatform(selectedAlbum.youtubeUrl)}
                    disabled={!selectedAlbum.youtubeUrl}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FaYoutube className="w-6 h-6 text-[#FF0000]" />
                      <span>YouTube</span>
                    </div>
                    {!selectedAlbum.youtubeUrl && <span className="text-sm text-gray-500">Not available</span>}
                  </button>
                </div>
                <button
                  onClick={() => setShowPlatforms(false)}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}