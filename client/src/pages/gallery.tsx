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

  // Try to load photos from Google Drive API, fallback to static
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const PHOTOS_FOLDER_ID = '1M5TFWy3JkQRJkGjYQqVqG4b4sLzEQNvP';
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${PHOTOS_FOLDER_ID}'+in+parents+and+mimeType+contains+'image'&key=${import.meta.env.VITE_GOOGLE_API_KEY}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)`
        );
        
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.files || []);
        }
      } catch (error) {
        console.log('Using offline mode for gallery');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <section className="h-full bg-white overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Gallery</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
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
          <div className="text-center py-20 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl text-gray-800 mb-4">Performance Gallery</h3>
              <p className="text-gray-600">
                Photo gallery will display performance photos when available.
              </p>
            </div>
          </div>
        )}

        {/* Photo grid would go here when photos are available */}
        {photos.length > 0 && (
          <div className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
            {/* Photo grid implementation */}
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
                className="absolute -top-2 -right-2 text-white hover:text-purple-400 text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
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