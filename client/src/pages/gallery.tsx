import { useQuery } from "@tanstack/react-query";
import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Photo } from "@shared/schema";

export default function Gallery() {
  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ['/api/photos'],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-purple-800 mb-4">Gallery</h2>
            <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Photos Available</h3>
              <p className="text-gray-500">Photos from Google Photos will appear here once connected.</p>
            </div>
          ) : (
            photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">{photo.title}</p>
                    {photo.description && (
                      <p className="text-sm text-gray-300">{photo.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Photos automatically synced from Google Photos</p>
          <Button className="bg-jazz-blue hover:bg-jazz-blue-light text-white font-semibold">
            <Images className="w-5 h-5 mr-2" />
            Load More Photos
          </Button>
        </div>
      </div>
    </section>
  );
}
