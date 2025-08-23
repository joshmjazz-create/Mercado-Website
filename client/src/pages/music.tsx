import { useState, useEffect } from "react";
import { ExternalLink, Play, Pause } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  category: string;
  coverImageUrl?: string;
  links: {
    spotify?: string;
    applemusic?: string;
    youtube?: string;
  };
  audioPreviewUrl?: string;
  imageFileUrl?: string;
}

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const MUSIC_FOLDER_ID = '1OLyT13wSRVAsUSI0rCFxwiLSQ_0MrmHz';
        const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${MUSIC_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Music API Response:', data);
          const categoryFolders = data.files || [];
          
          const allAlbums: Album[] = [];
          
          for (const categoryFolder of categoryFolders) {
            const categoryName = categoryFolder.name;
            const albumsInCategory = await fetchAlbumsInCategory(categoryFolder.id, categoryName);
            allAlbums.push(...albumsInCategory);
          }
          
          setAlbums(allAlbums);
        } else {
          const errorData = await response.json();
          console.error('Music API Error Response:', errorData);
        }
      } catch (error) {
        console.error('Music API Error:', error);
        console.log('Using offline mode for music');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  const fetchAlbumsInCategory = async (categoryFolderId: string, categoryName: string): Promise<Album[]> => {
    try {
      const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${categoryFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`
      );
      
      if (response.ok) {
        const data = await response.json();
        const albumFolders = data.files || [];
        
        const albums: Album[] = [];
        
        for (const albumFolder of albumFolders) {
          const albumData = await fetchAlbumData(albumFolder.id, albumFolder.name, categoryName);
          if (albumData) {
            albums.push(albumData);
          }
        }
        
        return albums;
      }
    } catch (error) {
      console.error('Error fetching albums in category:', error);
    }
    
    return [];
  };

  const fetchAlbumData = async (albumFolderId: string, folderName: string, categoryName: string): Promise<Album | null> => {
    try {
      const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
      const filesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${albumFolderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink)`
      );
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        const files = filesData.files || [];
        
        // Find Google Doc with metadata
        const docFile = files.find((file: any) => file.mimeType === 'application/vnd.google-apps.document');
        
        let albumMetadata: any = {
          title: folderName,
          artist: 'Joshua Mercado',
          year: new Date().getFullYear().toString(),
          links: {}
        };
        
        if (docFile) {
          albumMetadata = await fetchDocumentContent(docFile.id);
        }
        
        let coverImageUrl = '';
        let audioPreviewUrl = '';
        let imageFileUrl = '';
        
        if (categoryName === 'Upcoming') {
          // For upcoming albums, find image and audio files
          const imageFile = files.find((file: any) => file.mimeType?.startsWith('image/'));
          const audioFile = files.find((file: any) => file.mimeType?.startsWith('audio/'));
          
          if (imageFile) {
            imageFileUrl = `https://drive.google.com/uc?id=${imageFile.id}`;
          }
          if (audioFile) {
            audioPreviewUrl = `https://drive.google.com/uc?id=${audioFile.id}`;
          }
        } else {
          // For other categories, get Spotify cover art
          if (albumMetadata.links.spotify) {
            coverImageUrl = await fetchSpotifyCoverArt(albumMetadata.links.spotify);
          }
        }
        
        return {
          id: albumFolderId,
          title: albumMetadata.title || folderName,
          artist: albumMetadata.artist || 'Joshua Mercado',
          year: albumMetadata.year || new Date().getFullYear().toString(),
          category: categoryName,
          coverImageUrl,
          links: albumMetadata.links || {},
          audioPreviewUrl,
          imageFileUrl
        };
      }
    } catch (error) {
      console.error('Error fetching album data:', error);
    }
    
    return null;
  };

  const fetchDocumentContent = async (docId: string): Promise<any> => {
    try {
      const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}?key=${API_KEY}`
      );
      
      if (response.ok) {
        const docData = await response.json();
        const content = docData.body?.content || [];
        
        let text = '';
        content.forEach((element: any) => {
          if (element.paragraph) {
            element.paragraph.elements?.forEach((elem: any) => {
              if (elem.textRun) {
                text += elem.textRun.content;
              }
            });
          }
        });
        
        return parseDocumentMetadata(text);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
    
    return {};
  };

  const parseDocumentMetadata = (text: string): any => {
    const metadata: any = { links: {} };
    
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (key && value) {
        const keyLower = key.trim().toLowerCase();
        
        if (keyLower === 'title') {
          metadata.title = value;
        } else if (keyLower === 'artist') {
          metadata.artist = value;
        } else if (keyLower === 'year') {
          metadata.year = value;
        } else if (keyLower.includes('spotify')) {
          metadata.links.spotify = value;
        } else if (keyLower.includes('apple')) {
          metadata.links.applemusic = value;
        } else if (keyLower.includes('youtube')) {
          metadata.links.youtube = value;
        }
      }
    }
    
    return metadata;
  };

  const fetchSpotifyCoverArt = async (spotifyUrl: string): Promise<string> => {
    try {
      // Extract track/album ID from Spotify URL
      const match = spotifyUrl.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
      if (match) {
        const [, type, id] = match;
        const oembedResponse = await fetch(
          `https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`
        );
        
        if (oembedResponse.ok) {
          const oembedData = await oembedResponse.json();
          return oembedData.thumbnail_url || '';
        }
      }
    } catch (error) {
      console.error('Error fetching Spotify cover art:', error);
    }
    
    return '';
  };

  const handleAlbumClick = (album: Album) => {
    if (album.category === 'Upcoming') {
      handlePlayPreview(album);
    } else {
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handlePlayPreview = async (album: Album) => {
    if (!album.audioPreviewUrl) return;
    
    if (playingAudio === album.id) {
      // Stop current audio
      const audio = audioElements.get(album.id);
      if (audio) {
        audio.pause();
        setPlayingAudio(null);
      }
      return;
    }
    
    // Stop any currently playing audio
    if (playingAudio) {
      const currentAudio = audioElements.get(playingAudio);
      if (currentAudio) {
        currentAudio.pause();
        setPlayingAudio(null);
      }
    }
    
    let audio = audioElements.get(album.id);
    if (!audio) {
      audio = new Audio(album.audioPreviewUrl);
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));
      
      // Set up audio event listeners
      audio.addEventListener('loadedmetadata', () => {
        const startTime = audio!.duration / 3;
        audio!.currentTime = startTime;
        
        // Fade in
        audio!.volume = 0;
        audio!.play();
        
        const fadeInInterval = setInterval(() => {
          if (audio!.volume < 1) {
            audio!.volume = Math.min(1, audio!.volume + 0.1);
          } else {
            clearInterval(fadeInInterval);
          }
        }, 100);
        
        // Set timeout for fade out and stop after 15 seconds
        setTimeout(() => {
          const fadeOutInterval = setInterval(() => {
            if (audio!.volume > 0) {
              audio!.volume = Math.max(0, audio!.volume - 0.1);
            } else {
              clearInterval(fadeOutInterval);
              audio!.pause();
              setPlayingAudio(null);
            }
          }, 100);
        }, 15000);
      });

      // Reset state when audio ends
      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
      });
    } else {
      const startTime = audio.duration / 3;
      audio.currentTime = startTime;
      audio.volume = 0;
      audio.play();
      
      const fadeInInterval = setInterval(() => {
        if (audio!.volume < 1) {
          audio!.volume = Math.min(1, audio!.volume + 0.1);
        } else {
          clearInterval(fadeInInterval);
        }
      }, 100);
      
      setTimeout(() => {
        const fadeOutInterval = setInterval(() => {
          if (audio!.volume > 0) {
            audio!.volume = Math.max(0, audio!.volume - 0.1);
          } else {
            clearInterval(fadeOutInterval);
            audio!.pause();
            setPlayingAudio(null);
          }
        }, 100);
      }, 15000);
    }
    
    setPlayingAudio(album.id);
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  const renderAlbumSection = (title: string, albums: Album[], delay: number, showTitle: boolean = true) => {
    // Don't render anything if no albums and still loading
    if (albums.length === 0 && isLoading) {
      return null;
    }
    
    // Don't render anything if no albums and not loading (no content to show)
    if (albums.length === 0 && !isLoading) {
      return null;
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
              <div className="bg-gray-300 rounded-lg shadow-lg overflow-hidden border h-64 flex flex-col">
                {/* Album Cover */}
                <div className="flex-1 relative">
                  {album.coverImageUrl || album.imageFileUrl ? (
                    <img 
                      src={album.coverImageUrl || album.imageFileUrl} 
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                      <span className="text-gray-600">No Cover</span>
                    </div>
                  )}
                  
                  {/* Play button for upcoming albums */}
                  {album.category === 'Upcoming' && album.audioPreviewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="bg-white rounded-full p-3 hover:bg-gray-100 transition-colors">
                        {playingAudio === album.id ? (
                          <Pause className="w-6 h-6 text-gray-800" />
                        ) : (
                          <Play className="w-6 h-6 text-gray-800" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Album Info */}
                <div className="p-4 bg-gray-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{album.title}</h3>
                  <p className="text-gray-700 text-sm truncate">{album.artist}</p>
                  <p className="text-gray-600 text-xs">{album.year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const originalAlbums = albums.filter(album => album.category === 'My Music');
  const featuredAlbums = albums.filter(album => album.category === 'Featured On');
  const upcomingAlbums = albums.filter(album => album.category === 'Upcoming');

  return (
    <section className="min-h-screen md:h-full bg-jazz-grey md:overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Music</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* My Music Section - No title, displayed first */}
            {originalAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '400ms' }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {originalAlbums.map((album, index) => (
                    <div
                      key={`${album.title}-${index}`}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <div className="bg-gray-300 rounded-lg shadow-lg overflow-hidden border aspect-square flex flex-col">
                        {/* Album Cover */}
                        <div className="flex-1 relative">
                          {album.coverImageUrl ? (
                            <img 
                              src={album.coverImageUrl} 
                              alt={album.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">No Cover</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Album Info */}
                        <div className="p-3 bg-gray-300">
                          <h3 className="text-sm font-bold text-gray-800 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-700 text-xs truncate">{album.artist}</p>
                          <p className="text-gray-600 text-xs">{album.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured On Section */}
            {featuredAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '600ms' }}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-left underline decoration-purple-500">Featured On</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredAlbums.map((album, index) => (
                    <div
                      key={`${album.title}-${index}`}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <div className="bg-gray-300 rounded-lg shadow-lg overflow-hidden border aspect-square flex flex-col">
                        {/* Album Cover */}
                        <div className="flex-1 relative">
                          {album.coverImageUrl ? (
                            <img 
                              src={album.coverImageUrl} 
                              alt={album.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">No Cover</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Album Info */}
                        <div className="p-3 bg-gray-300">
                          <h3 className="text-sm font-bold text-gray-800 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-700 text-xs truncate">{album.artist}</p>
                          <p className="text-gray-600 text-xs">{album.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '800ms' }}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-left underline decoration-purple-500">Upcoming</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {upcomingAlbums.map((album, index) => (
                    <div
                      key={`${album.title}-${index}`}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handlePlayPreview(album)}
                    >
                      <div className="bg-gray-300 rounded-lg shadow-lg overflow-hidden border aspect-square flex flex-col">
                        {/* Album Cover */}
                        <div className="flex-1 relative">
                          {album.imageFileUrl ? (
                            <img 
                              src={album.imageFileUrl} 
                              alt={album.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">No Cover</span>
                            </div>
                          )}
                          
                          {/* Loading/Play/Pause overlay for audio preview */}
                          {album.audioPreviewUrl && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {playingAudio === album.id ? (
                                <div className="bg-black bg-opacity-50 rounded-full p-3">
                                  <Pause className="w-8 h-8 text-white" />
                                </div>
                              ) : (
                                <div className="bg-black bg-opacity-50 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Album Info */}
                        <div className="p-3 bg-gray-300">
                          <h3 className="text-sm font-bold text-gray-800 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-700 text-xs truncate">{album.artist}</p>
                          <p className="text-gray-600 text-xs mb-1">{album.year}</p>
                          {album.audioPreviewUrl && (
                            <p className="text-purple-600 text-xs font-medium">Preview Available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

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