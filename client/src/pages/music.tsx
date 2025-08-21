import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface Album {
  id: string;
  title: string;
  artist: string;
  description: string;
  coverImageUrl: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  youtubeUrl: string | null;
  releaseDate: string;
  category: string;
  audioPreviewUrl: string | null;
  createdAt: Date;
}

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const { data: albums, isLoading, error } = useQuery({
    queryKey: ['/api/albums'],
    queryFn: async () => {
      const response = await apiRequest('/api/albums');
      return response;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setShowPlatforms(true);
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'original': return 'My Music';
      case 'featured': return 'Featured On';
      case 'upcoming': return 'Upcoming';
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Failed to load albums</div>
      </div>
    );
  }

  // Group albums by category
  const categorizedAlbums = albums?.reduce((acc: Record<string, Album[]>, album: Album) => {
    if (!acc[album.category]) {
      acc[album.category] = [];
    }
    acc[album.category].push(album);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-800 mb-4 font-serif">Music</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>

        {Object.entries(categorizedAlbums).map(([category, categoryAlbums]) => (
          <div key={category} className="mb-12">
            {category !== 'original' && (
              <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center font-serif">
                {getCategoryTitle(category)}
              </h2>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryAlbums.map((album, index) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center">
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-4xl text-purple-300">♪</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-purple-800 mb-1">{album.title}</h3>
                    <p className="text-gray-600 text-sm">{album.artist}</p>
                    {album.releaseDate && (
                      <p className="text-gray-500 text-xs mt-1">{new Date(album.releaseDate).getFullYear()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Platform Selection Dialog */}
        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-xl font-bold text-purple-800 mb-4">
              Listen to "{selectedAlbum?.title}"
            </DialogTitle>
            
            <div className="space-y-3">
              {selectedAlbum?.spotifyUrl && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.spotifyUrl!)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaSpotify className="text-xl" />
                  <span className="font-medium">Spotify</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {selectedAlbum?.appleMusicUrl && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.appleMusicUrl!)}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaApple className="text-xl" />
                  <span className="font-medium">Apple Music</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {selectedAlbum?.youtubeUrl && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.youtubeUrl!)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaYoutube className="text-xl" />
                  <span className="font-medium">YouTube</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {(!selectedAlbum?.spotifyUrl && !selectedAlbum?.appleMusicUrl && !selectedAlbum?.youtubeUrl) && (
                <div className="text-center py-8 text-gray-500">
                  Links not available yet
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}