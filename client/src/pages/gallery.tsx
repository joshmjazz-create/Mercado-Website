import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DrivePhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  directUrl: string;
  largeUrl: string;
  fallbackUrl: string;
  webViewLink: string;
  mimeType: string;
  createdTime: string;
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Joshua's Google Drive performance photos folder
  const driveShareUrl = "https://drive.google.com/drive/folders/1ORtM5yFEzaCN5B_Sx3ErmDH5qTDCRXGd";

  // Force invalidate cache on mount to get fresh images
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/drive/shared-photos'] });
  }, [queryClient]);
  
  const { data: photos = [], isLoading, error } = useQuery<DrivePhoto[]>({
    queryKey: ['/api/drive/shared-photos'],
    queryFn: async () => {
      const response = await fetch('/api/drive/shared-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareUrl: driveShareUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      return response.json();
    },
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache (TanStack Query v5 uses gcTime instead of cacheTime)
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-purple-800 mb-4">Gallery</h2>
            <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-64 w-full bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-purple-800 mb-4">Gallery</h2>
            <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
          </div>
          
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Unable to Load Gallery</h3>
            <p className="text-gray-500">Please check Google Drive permissions and folder settings.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-purple-800 mb-4">Gallery</h2>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Photos Found</h3>
              <p className="text-gray-500">Check that your Google Drive folder contains images and is properly shared.</p>
            </div>
          ) : (
            photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Use largeUrl for lightbox display instead of directUrl
                  setSelectedPhoto(photo.largeUrl || photo.thumbnailUrl);
                }}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.name}
                  className="w-full h-64 object-contain bg-gray-100 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Try fallback URLs if main thumbnail fails
                    const target = e.target as HTMLImageElement;
                    if (target.src === photo.thumbnailUrl && photo.fallbackUrl) {
                      target.src = photo.fallbackUrl;
                    } else if (target.src === photo.fallbackUrl && photo.largeUrl) {
                      target.src = photo.largeUrl;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedPhoto(null);
            }}
          >
            <div 
              className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto}
                alt="Gallery photo"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onLoad={() => console.log('Lightbox image loaded:', selectedPhoto)}
                onError={(e) => {
                  console.error('Lightbox image failed to load:', selectedPhoto);
                  // Try to reload with a cache-busting parameter
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('?refresh=')) {
                    target.src = selectedPhoto + '?refresh=' + Date.now();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPhoto(null);
                }}
                className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:text-gray-300 hover:bg-opacity-70 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Performance gallery powered by Google Drive - {photos.length} photos
          </p>
        </div>
      </div>
    </section>
  );
}