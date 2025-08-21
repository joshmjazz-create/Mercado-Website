import { useQuery } from '@tanstack/react-query';

// Biography Google Drive folder ID
const BIOGRAPHY_FOLDER_URL = 'https://drive.google.com/drive/folders/1RH0mRswhyD0rXU2mAsrj3fGpevbcw1Th';

// Static fallback content - matches exact original formatting
const STATIC_BIOGRAPHY = `Joshua Mercado is a young, up and coming trumpet player based in New Jersey. Raised in Central Florida, he earned his Bachelor's degree in Jazz Studies from the University of Central Florida and is currently pursuing a Master's degree at William Paterson University, where he studies with renowned trumpeter Jeremy Pelt.

Mercado moved into the New York City area in 2024 where he quickly started getting his name out and onto the scene. He regularly performs with Winard Harper and the Jeli Posse, having played at venues such as The Bean Runner and Martha's Vineyard in Massachusetts. Other notable musicians he's played with throughout his young career are Joy Brown, Rodney Green, Mike Lee, and Clarence Penn, performing at some of the top clubs in the city such as Smalls and Dizzy's Jazz Club.

His versatility as a musician has also led him to national touring opportunities. In 2024, he went on the road with Joey Fatone (NSYNC) and AJ McLean (Backstreet Boys) on their A Legendary Night tour, performing at historic venues such as The Ryman, The Factory, and The MGM Grand National Harbor. Through his connection with Joey Fatone, he has shared the stage with other celebrities, including but not limited to Debbie Gibson, Lance Bass, Chris Kirkpatrick, Montell Jordan, Shawn Stockman, Wanya Morris, and even Murr from Impractical Jokers.`;

// Function to parse biography content with exact formatting
function parseBiographyContent(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    // Create JSX with specific italicization for the exact titles mentioned in replit.md
    let processedText = paragraph;
    
    // Italicize "A Legendary Night" specifically
    processedText = processedText.replace(/A Legendary Night/g, '<em>A Legendary Night</em>');
    
    // Italicize "Impractical Jokers" specifically  
    processedText = processedText.replace(/Impractical Jokers/g, '<em>Impractical Jokers</em>');
    
    return (
      <p 
        key={index}
        className="opacity-0 translate-y-4 animate-in" 
        style={{ animationDelay: `${600 + (index * 200)}ms` }}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  });
}

export default function Bio() {
  // Fetch biography from Google Drive with silent fallback
  const { data: biography } = useQuery({
    queryKey: ['biography'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/drive/biography', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shareUrl: BIOGRAPHY_FOLDER_URL }),
        });

        if (!response.ok) {
          return STATIC_BIOGRAPHY;
        }

        const data = await response.json();
        return data.biography;
      } catch (error) {
        // Silent fallback - no console errors shown to user
        return STATIC_BIOGRAPHY;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Always use content immediately - either from API or static fallback
  const content = biography || STATIC_BIOGRAPHY;

  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Biography</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="prose prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
              {parseBiographyContent(content)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
