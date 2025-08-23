import { useState, useEffect } from "react";

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Handle window resize for responsive sizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load photos from Google Drive API
  const [photos, setPhotos] = useState<any[]>([]);
  const [processedPhotos, setProcessedPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const PHOTOS_FOLDER_ID = '1OLyT13wSRVAsUSI0rCFxwiLSQ_0MrmHz';
        const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${PHOTOS_FOLDER_ID}'+in+parents+and+mimeType+contains+'image'&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)`
        );
        
        if (response.ok) {
          const data = await response.json();
          const photosWithDimensions = await Promise.all(
            (data.files || []).map(async (photo: any) => {
              const imageUrl = `https://drive.google.com/uc?id=${photo.id}`;
              const dimensions = await getImageDimensions(imageUrl);
              return {
                ...photo,
                imageUrl,
                ...dimensions
              };
            })
          );
          setPhotos(photosWithDimensions);
          setProcessedPhotos(organizePhotosForLayout(photosWithDimensions));
        }
      } catch (error) {
        console.log('Using offline mode for gallery');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const getImageDimensions = (src: string): Promise<{width: number, height: number, orientation: string}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const orientation = aspectRatio > 1.2 ? 'horizontal' : aspectRatio < 0.8 ? 'vertical' : 'square';
        resolve({
          width: img.width,
          height: img.height,
          orientation
        });
      };
      img.onerror = () => {
        resolve({ width: 1, height: 1, orientation: 'square' });
      };
      img.src = src;
    });
  };

  const organizePhotosForLayout = (photos: any[]) => {
    const horizontal = photos.filter(p => p.orientation === 'horizontal');
    const vertical = photos.filter(p => p.orientation === 'vertical');
    const square = photos.filter(p => p.orientation === 'square');
    
    const organized = [];
    let hIndex = 0, vIndex = 0, sIndex = 0;
    
    while (hIndex < horizontal.length || vIndex < vertical.length || sIndex < square.length) {
      // Try to create groups: 2 horizontal + 1 vertical, or mix with squares
      if (hIndex < horizontal.length - 1 && vIndex < vertical.length) {
        // Group: 2 horizontal with 1 vertical
        organized.push({
          type: 'group',
          items: [
            { ...horizontal[hIndex], position: 'top-left' },
            { ...horizontal[hIndex + 1], position: 'bottom-left' },
            { ...vertical[vIndex], position: 'right' }
          ]
        });
        hIndex += 2;
        vIndex += 1;
      } else if (sIndex < square.length - 1) {
        // Group: 2 squares side by side
        organized.push({
          type: 'group',
          items: [
            { ...square[sIndex], position: 'left' },
            { ...square[sIndex + 1], position: 'right' }
          ]
        });
        sIndex += 2;
      } else {
        // Single items
        if (hIndex < horizontal.length) {
          organized.push({ type: 'single', item: horizontal[hIndex] });
          hIndex++;
        } else if (vIndex < vertical.length) {
          organized.push({ type: 'single', item: vertical[vIndex] });
          vIndex++;
        } else if (sIndex < square.length) {
          organized.push({ type: 'single', item: square[sIndex] });
          sIndex++;
        }
      }
    }
    
    return organized;
  };

  return (
    <section className="min-h-screen md:h-full bg-jazz-grey md:overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Gallery</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">Error loading photos</p>
          </div>
        )}

        {!isLoading && !error && photos.length === 0 && (
          // Don't show placeholder - just empty space when no photos
          <div></div>
        )}

        {/* Organized photo layout */}
        {!isLoading && processedPhotos.length > 0 && (
          <div className="opacity-0 translate-y-4 animate-in space-y-4" style={{ animationDelay: '400ms' }}>
            {processedPhotos.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                {group.type === 'group' ? (
                  <div className="grid grid-cols-2 gap-4 h-80">
                    {group.items.length === 3 ? (
                      // 2 horizontal + 1 vertical layout
                      <>
                        <div className="space-y-4">
                          {group.items.filter((item: any) => item.position.includes('left')).map((item: any, idx: number) => (
                            <div 
                              key={idx}
                              className="h-36 cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                              onClick={() => setSelectedPhoto(item.imageUrl)}
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="h-full">
                          {group.items.filter((item: any) => item.position === 'right').map((item: any, idx: number) => (
                            <div 
                              key={idx}
                              className="h-full cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                              onClick={() => setSelectedPhoto(item.imageUrl)}
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      // 2 squares side by side
                      group.items.map((item: any, idx: number) => (
                        <div 
                          key={idx}
                          className="h-full cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                          onClick={() => setSelectedPhoto(item.imageUrl)}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Single image
                  <div 
                    className="w-full h-64 cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow mx-auto max-w-md"
                    onClick={() => setSelectedPhoto(group.item.imageUrl)}
                  >
                    <img
                      src={group.item.imageUrl}
                      alt={group.item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for enlarged photo view */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-4xl p-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-2 -right-2 text-white hover:text-purple-500 text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ×
              </button>
              <img
                src={selectedPhoto}
                alt="Gallery photo"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}