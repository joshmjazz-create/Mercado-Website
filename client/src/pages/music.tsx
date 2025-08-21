import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
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
  });

  const handleAlbumClick = (album: DriveAlbum) => {
    setSelectedAlbum(album);
    setShowPlatforms(true);
  };

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
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-purple-800 mb-6 underline text-left">
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="cursor-pointer group transition-transform hover:scale-105"
              onClick={() => handleAlbumClick(album)}
            >
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                {album.coverImageUrl ? (
                  <img
                    src={album.coverImageUrl}
                    alt={`${album.title} cover`}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/300/300';
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
              </div>
              <h4 className="font-semibold text-sm text-center truncate">
                {album.title}
              </h4>
              <p className="text-xs text-gray-600 text-center truncate">
                {album.artist}
              </p>
              {album.year && (
                <p className="text-xs text-gray-500 text-center">
                  {album.year}
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