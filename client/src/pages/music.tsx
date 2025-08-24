import { useState, useEffect, useRef } from "react";
import { ExternalLink, Play, Pause } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

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
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  const scrollRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const MUSIC_FOLDER_ID = '1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6';
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

  // Handle custom scrollbar fade effect
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      scrollElement.classList.add('scrolling');
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        scrollElement.classList.remove('scrolling');
      }, 2000);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
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
            imageFileUrl = `https://lh3.googleusercontent.com/d/${imageFile.id}`;
          }
          if (audioFile) {
            console.log('Found audio file:', audioFile.name, audioFile.id);
            // Use Google Drive API download endpoint with authentication
            audioPreviewUrl = `https://www.googleapis.com/drive/v3/files/${audioFile.id}?alt=media&key=AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI`;
            console.log('Audio preview URL:', audioPreviewUrl);
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
      // Use the export endpoint to get plain text content
      const response = await fetch(
        `https://docs.google.com/document/d/${docId}/export?format=txt`
      );
      
      if (response.ok) {
        const text = await response.text();
        console.log('Document content loaded:', text.substring(0, 200));
        
        // Parse the text to extract album metadata
        const lines = text.split('\n').filter(line => line.trim());
        const metadata: any = {
          title: '',
          artist: 'Joshua Mercado',
          year: new Date().getFullYear().toString(),
          links: {}
        };
        
        let currentSection = '';
        lines.forEach(line => {
          const trimmedLine = line.trim();
          
          // Handle main metadata fields
          if (trimmedLine.startsWith('TITLE:')) {
            metadata.title = trimmedLine.replace('TITLE:', '').trim();
          } else if (trimmedLine.startsWith('ARTIST:')) {
            metadata.artist = trimmedLine.replace('ARTIST:', '').trim();
          } else if (trimmedLine.startsWith('YEAR:')) {
            metadata.year = trimmedLine.replace('YEAR:', '').trim();
          } else if (trimmedLine === 'LINKS:') {
            currentSection = 'links';
          } else if (currentSection === 'links' && trimmedLine.includes(' - ')) {
            // Parse link lines like "Spotify - https://..."
            const [platform, url] = trimmedLine.split(' - ');
            const platformKey = platform.trim().toLowerCase();
            
            if (platformKey === 'spotify') {
              metadata.links.spotify = url.trim();
            } else if (platformKey === 'apple music') {
              metadata.links.applemusic = url.trim();
            } else if (platformKey === 'youtube') {
              metadata.links.youtube = url.trim();
            }
          }
        });
        
        return metadata;
      } else {
        console.error('Failed to export document as text:', response.status);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
    
    return {
      title: '',
      artist: 'Joshua Mercado',
      year: new Date().getFullYear().toString(),
      links: {}
    };
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
    console.log('Playing preview for album:', album.title, 'URL:', album.audioPreviewUrl);
    if (!album.audioPreviewUrl) {
      console.log('No audio preview URL available for:', album.title);
      return;
    }
    
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
    
    setLoadingAudio(album.id);
    
    let audio = audioElements.get(album.id);
    if (!audio) {
      console.log('Creating new audio element for:', album.title);
      audio = new Audio(album.audioPreviewUrl);
      audio.preload = 'auto';
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));
      
      // Add error handling
      audio.addEventListener('error', (e) => {
        console.error('Audio error for', album.title, ':', e);
        setLoadingAudio(null);
        setPlayingAudio(null);
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through for:', album.title);
        setLoadingAudio(null);
      });

      // Reset state when audio ends
      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
      });
    }
    
    // Wait for audio to be ready
    if (audio.readyState >= 4) {
      // Audio is ready to play
      const startTime = audio.duration / 3;
      audio.currentTime = startTime;
      audio.volume = 0;
      
      audio.play().then(() => {
        setPlayingAudio(album.id);
        setLoadingAudio(null);
        
        // Fade in
        const fadeInInterval = setInterval(() => {
          if (audio!.volume < 1) {
            audio!.volume = Math.min(1, audio!.volume + 0.05);
          } else {
            clearInterval(fadeInInterval);
          }
        }, 50);
        
        // Set timeout for fade out and stop after 15 seconds
        setTimeout(() => {
          const fadeOutInterval = setInterval(() => {
            if (audio!.volume > 0) {
              audio!.volume = Math.max(0, audio!.volume - 0.05);
            } else {
              clearInterval(fadeOutInterval);
              audio!.pause();
              setPlayingAudio(null);
            }
          }, 50);
        }, 15000);
      }).catch((error) => {
        console.error('Audio play failed:', error);
        setLoadingAudio(null);
        setPlayingAudio(null);
      });
    } else {
      // Audio not ready, wait for it to load
      audio.addEventListener('canplaythrough', () => {
        const startTime = audio!.duration / 3;
        audio!.currentTime = startTime;
        audio!.volume = 0;
        
        audio!.play().then(() => {
          setPlayingAudio(album.id);
          setLoadingAudio(null);
          
          // Fade in
          const fadeInInterval = setInterval(() => {
            if (audio!.volume < 1) {
              audio!.volume = Math.min(1, audio!.volume + 0.05);
            } else {
              clearInterval(fadeInInterval);
            }
          }, 50);
          
          // Set timeout for fade out and stop after 15 seconds
          setTimeout(() => {
            const fadeOutInterval = setInterval(() => {
              if (audio!.volume > 0) {
                audio!.volume = Math.max(0, audio!.volume - 0.05);
              } else {
                clearInterval(fadeOutInterval);
                audio!.pause();
                setPlayingAudio(null);
              }
            }, 50);
          }, 15000);
        }).catch((error) => {
          console.error('Audio play failed:', error);
          setLoadingAudio(null);
          setPlayingAudio(null);
        });
      }, { once: true });
    }
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
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
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
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {originalAlbums.map((album, index) => (
                    <div
                      key={`${album.title}-${index}`}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        {/* Album Cover */}
                        <div className="aspect-square relative">
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
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          <p className="text-gray-500 text-sm">{album.year}</p>
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
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {featuredAlbums.map((album, index) => (
                    <div
                      key={`${album.title}-${index}`}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        {/* Album Cover */}
                        <div className="aspect-square relative">
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
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          <p className="text-gray-500 text-sm">{album.year}</p>
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
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {upcomingAlbums.map((album, index) => (
                    <div
                      key={`${album.title}-${index}`}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handlePlayPreview(album)}
                    >
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        {/* Album Cover */}
                        <div className="aspect-square relative">
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
                              {loadingAudio === album.id ? (
                                <div className="bg-black bg-opacity-50 rounded-full p-3">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                              ) : playingAudio === album.id ? (
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
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          {album.audioPreviewUrl && (
                            <p className="text-purple-600 text-sm font-medium">Preview Available</p>
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
            {/* Album Cover */}
            <div className="flex justify-center mb-6">
              {selectedAlbum?.coverImageUrl || selectedAlbum?.imageFileUrl ? (
                <img 
                  src={selectedAlbum.coverImageUrl || selectedAlbum.imageFileUrl} 
                  alt={selectedAlbum.title}
                  className="w-48 h-48 object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-400 flex items-center justify-center rounded-lg shadow-lg">
                  <span className="text-gray-600">No Cover</span>
                </div>
              )}
            </div>
            
            {/* Album Info */}
            <div className="text-center mb-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-gray-800 text-xl mb-2">
                {selectedAlbum?.title}
              </DialogTitle>
              <p className="text-gray-600 text-lg mb-1">{selectedAlbum?.artist}</p>
              <p className="text-gray-500 text-base">{selectedAlbum?.year}</p>
            </div>
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
      
      {/* Mobile Footer - only show when content is loaded */}
      {!isLoading && (
        <div className="md:hidden">
          <Footer />
        </div>
      )}
    </section>
  );
}