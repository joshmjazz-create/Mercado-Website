import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StaticAlbum {
  title: string;
  artist: string;
  year: string;
  category: string;
  links: {
    spotify?: string;
    applemusic?: string;
    youtube?: string;
  };
}

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<StaticAlbum | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);

  // Static album data for reliable deployment
  const staticAlbums: StaticAlbum[] = [];

  const handleAlbumClick = (album: StaticAlbum) => {
    setSelectedAlbum(album);
    setShowPlatforms(true);
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  const renderAlbumSection = (title: string, albums: StaticAlbum[], delay: number, showTitle: boolean = true) => {
    if (albums.length === 0) {
      return (
        <div 
          className="opacity-0 translate-y-4 animate-in mb-8" 
          style={{ animationDelay: `${delay}ms` }}
        >
          {showTitle && <h2 className="text-2xl font-semibold text-gray-400 mb-8 text-left underline">{title}</h2>}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              Music catalog will display albums when available.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="opacity-0 translate-y-4 animate-in mb-8" 
        style={{ animationDelay: `${delay}ms` }}
      >
        {showTitle && <h2 className="text-2xl font-semibold text-gray-400 mb-8 text-left underline">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album, index) => (
            <div
              key={`${album.title}-${index}`}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => handleAlbumClick(album)}
            >
              <div className="bg-white rounded-lg shadow-lg p-6 text-center h-64 flex flex-col justify-center border">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{album.title}</h3>
                <p className="text-gray-600 mb-1">{album.artist}</p>
                <p className="text-gray-500 text-sm">{album.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const originalAlbums = staticAlbums.filter(album => album.category === 'original');
  const featuredAlbums = staticAlbums.filter(album => album.category === 'featured');
  const upcomingAlbums = staticAlbums.filter(album => album.category === 'upcoming');

  return (
    <section className="h-screen bg-white overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Music</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>

        {renderAlbumSection("My Music", originalAlbums, 400, false)}
        {renderAlbumSection("Featured On", featuredAlbums, 600)}
        {renderAlbumSection("Upcoming", upcomingAlbums, 800)}

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