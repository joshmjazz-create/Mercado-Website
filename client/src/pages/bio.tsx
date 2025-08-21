import { useQuery } from '@tanstack/react-query';

export default function Bio() {
  const biographyFolderUrl = "https://drive.google.com/drive/folders/1RH0mRswhyD0rXU2mAsrj3fGpevbcw1Th";

  const { data: biographyContent, isLoading, error } = useQuery({
    queryKey: ['/api/biography'],
    queryFn: async (): Promise<{ content: string }> => {
      const response = await fetch('/api/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareUrl: biographyFolderUrl })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch biography: ${response.status}`);
      }
      
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Function to format the text content with proper paragraphs and italics
  const formatBiographyText = (content: string) => {
    if (!content) return [];
    
    // Split into paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
    
    return paragraphs.map((paragraph, index) => {
      // Handle italics for specific titles - preserve the same formatting as the static version
      let formattedText = paragraph
        .replace(/A Legendary Night/g, '<em>A Legendary Night</em>')
        .replace(/Impractical Jokers/g, '<em>Impractical Jokers</em>');
      
      return (
        <p 
          key={index} 
          className="opacity-0 translate-y-4 animate-in leading-relaxed mb-6"
          style={{ animationDelay: `${600 + index * 200}ms` }}
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800 mx-auto mb-4"></div>
              <p className="text-purple-800 font-medium">Loading biography...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4 text-xl">Unable to load biography content</p>
              <p className="text-sm text-gray-500">Please check your connection and try again</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-16 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
              <h1 className="text-5xl font-bold text-purple-800 mb-6">Biography</h1>
              <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
            </div>

            <div className="max-w-4xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                <div className="prose prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
                  {formatBiographyText(biographyContent?.content || '')}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
