import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
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

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<DriveAlbum | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);

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
    refetchOnWindowFocus: false, // Don't refetch on focus
    retry: 1, // Reduce retry attempts for faster failure
  });

  const handleAlbumClick = (album: DriveAlbum) => {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-purple-800 mb-4 font-serif">Music</h1>
            <div className="w-24 h-1 bg-purple-800 mx-auto mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-purple-800 mb-4 font-serif">Music</h1>
            <div className="w-24 h-1 bg-purple-800 mx-auto mb-8"></div>
          </div>
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">Unable to load albums from Google Drive</div>
            <div className="text-gray-600">Please check your internet connection and try again</div>
          </div>
        </div>
      </div>
    );
  }

  const allAlbums = [
    ...(categories?.original || []),
    ...(categories?.featured || []),
    ...(categories?.upcoming || [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-800 mb-4 font-serif">Music</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>

        {/* My Music (Original) - No header shown */}
        {categories?.original && categories.original.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.original.map((album, index) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center">
                    {album.coverImageUrl ? (
                      <img
                        src={`https://drive.google.com/thumbnail?id=${album.coverImageUrl}&sz=w400-h400`}
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
                    {album.year && (
                      <p className="text-gray-500 text-xs mt-1">{album.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured On */}
        {categories?.featured && categories.featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center font-serif">
              Featured On
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.featured.map((album, index) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(categories?.original?.length || 0) * 100 + index * 100}ms` }}
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center">
                    {album.coverImageUrl ? (
                      <img
                        src={`https://drive.google.com/thumbnail?id=${album.coverImageUrl}&sz=w400-h400`}
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
                    {album.year && (
                      <p className="text-gray-500 text-xs mt-1">{album.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {categories?.upcoming && categories.upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center font-serif">
              Upcoming
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.upcoming.map((album, index) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl opacity-0 animate-fade-in"
                  style={{ animationDelay: `${((categories?.original?.length || 0) + (categories?.featured?.length || 0)) * 100 + index * 100}ms` }}
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center">
                    {album.coverImageUrl ? (
                      <img
                        src={`https://drive.google.com/thumbnail?id=${album.coverImageUrl}&sz=w400-h400`}
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
                    {album.year && (
                      <p className="text-gray-500 text-xs mt-1">{album.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Selection Dialog */}
        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-xl font-bold text-purple-800 mb-4">
              Listen to "{selectedAlbum?.title}"
            </DialogTitle>
            
            <div className="space-y-3">
              {selectedAlbum?.links?.spotify && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.links.spotify!)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaSpotify className="text-xl" />
                  <span className="font-medium">Spotify</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {selectedAlbum?.links?.applemusic && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.links.applemusic!)}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaApple className="text-xl" />
                  <span className="font-medium">Apple Music</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {selectedAlbum?.links?.youtube && (
                <Button
                  onClick={() => handlePlatformClick(selectedAlbum.links.youtube!)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaYoutube className="text-xl" />
                  <span className="font-medium">YouTube</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              {(!selectedAlbum?.links?.spotify && !selectedAlbum?.links?.applemusic && !selectedAlbum?.links?.youtube) && (
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