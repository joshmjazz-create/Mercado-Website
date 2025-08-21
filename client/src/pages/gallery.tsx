import { useEffect } from "react";

export default function Gallery() {
  useEffect(() => {
    // Load PublicAlbum script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/publicalbum@latest/embed-ui.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-purple-800 mb-4">Gallery</h2>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Google Photos Album Grid */}
          <div 
            className="pa-carousel-widget rounded-lg" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
            data-link="https://photos.app.goo.gl/Aiv4XCPayaM17DMy9"
            data-title="Joshua Mercado Performance Gallery"
            data-description="Capturing moments from performances, studio sessions, and musical journeys"
            data-repeat="false"
            data-delay="0"
            data-fullscreen="false"
          >
            <object 
              data="https://lh3.googleusercontent.com/pw/AP1GczPslFa0ml9Lb3_7bXsh8WOgP4kzeTGO-62dNAfFsFMQ1gbaQfNWClvRIyNJlJO7iCZoOVBeJG92WPE9oBY3frKFf_PEDjoL_ubeVFiZQ3ddIeFKEaOK=w1920-h1080"
              className="w-full rounded-lg"
            >
            </object>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Photo gallery from Google Photos - click any photo to view full size
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}