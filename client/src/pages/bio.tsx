import { useState, useEffect } from "react";
import Footer from "@/components/footer";

const bioImagePath = "./assets/Headshot_2_1755873415112.jpeg";

function parseBiographyContent(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    let processedText = paragraph;
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processedText = processedText.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    console.log(`Paragraph ${index} processed:`, processedText.substring(0, 100));
    
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
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    document.title = "Bio";
  }, []);
  
  useEffect(() => {
    const fetchBioContent = async () => {
      try {
        console.log('Fetching biography content from public Google Doc... (cache bypassed)');
        const docContent = await fetchDocumentContent();
        console.log('Bio content loaded from public Google Docs with formatting preserved');
        setContent(docContent);
      } catch (error) {
        console.error('Bio API Error:', error);
        setContent('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBioContent();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Bio image preloaded');
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.log('Bio image failed to load');
      setImageLoaded(true);
    };
    img.src = bioImagePath;
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - refetching bio content for updates');
      setIsLoading(true);
      const fetchBioContent = async () => {
        try {
          const docContent = await fetchDocumentContent();
          setContent(docContent);
        } catch (error) {
          console.error('Bio refetch error:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchBioContent();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDocumentContent = async (): Promise<string> => {
    try {
      console.log('Fetching public Google Doc');
      const cacheBuster = Date.now();
      const response = await fetch(
        `https://docs.google.com/document/d/e/2PACX-1vTApJaXwg34sAi_yd5vJA0fcdLIzyW9fcRwi9BfQ0PKzEb-8x7X1OEjlJdX7C-O-CEa0jzop997cimB/pub?_=${cacheBuster}`,
        {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
      
      console.log('Public Google Docs response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Public Google Docs error:', errorText);
        throw new Error('Failed to fetch document');
      }
      
      const htmlContent = await response.text();
      console.log('HTML content received, length:', htmlContent.length);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const sampleParagraphs = tempDiv.querySelectorAll('p');
      console.log('Total paragraphs found:', sampleParagraphs.length);
      
      sampleParagraphs.forEach((p, index) => {
        if (index < 3) {
          console.log(`Paragraph ${index + 1} HTML:`, p.outerHTML.substring(0, 300));
        }
      });
      
      const styles = tempDiv.querySelectorAll('style');
      styles.forEach((style, index) => {
        if (style.textContent?.includes('italic')) {
          console.log(`Style ${index} with italic:`, style.textContent.substring(0, 500));
        }
      });
      
      return convertHtmlToFormattedText(htmlContent);
    } catch (error) {
      console.error('Error fetching document content:', error);
      throw error;
    }
  };

  const convertHtmlToFormattedText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const allStyleTags = tempDiv.querySelectorAll('style');
    const italicClasses = new Set<string>();
    
    console.log(`Found ${allStyleTags.length} style tags`);
    
    allStyleTags.forEach((styleTag, index) => {
      const styles = styleTag.textContent || '';
      console.log(`Style tag ${index} length:`, styles.length);
      
      if (styles.includes('.c4{font-style:italic}')) {
        italicClasses.add('c4');
        console.log('Found italic class c4 in style tag', index);
      }
      
      const italicMatches = styles.match(/\.c\d+[^}]*font-style:italic/g);
      if (italicMatches) {
        italicMatches.forEach(match => {
          const classMatch = match.match(/\.c(\d+)/);
          if (classMatch) {
            italicClasses.add(`c${classMatch[1]}`);
            console.log('Found italic class via regex:', `c${classMatch[1]}`);
          }
        });
      }
    });
    
    const allSpans = tempDiv.querySelectorAll('span.c4');
    console.log('Found spans with c4 class:', allSpans.length);
    allSpans.forEach((span, index) => {
      if (index < 3) {
        console.log(`c4 span ${index}:`, span.textContent);
      }
    });
    
    const contentArea = tempDiv.querySelector('[id*="contents"]') || tempDiv;
    const paragraphs = contentArea.querySelectorAll('p');
    
    const processedParagraphs: string[] = [];
    
    paragraphs.forEach((p) => {
      let paragraphText = '';
      
      const spans = p.querySelectorAll('span');
      if (spans.length === 0) {
        paragraphText = p.textContent?.trim() || '';
      } else {
        for (let i = 0; i < spans.length; i++) {
          const span = spans[i];
          const text = span.textContent || '';
          
          if (text.trim()) {
            const hasItalicClass = Array.from(span.classList).some(className => 
              italicClasses.has(className)
            );
            
            console.log(`Span ${i} text: "${text}", classes: [${Array.from(span.classList).join(', ')}], isItalic: ${hasItalicClass}`);
            
            const nextSpan = spans[i + 1];
            const isWordBroken = text.trim() && !text.endsWith(' ') && 
                               nextSpan && nextSpan.textContent && 
                               !nextSpan.textContent.startsWith(' ') &&
                               hasItalicClass;
            
            if (isWordBroken && nextSpan) {
              const nextText = nextSpan.textContent || '';
              const firstWordMatch = nextText.match(/^(\S+)(.*)$/);
              
              if (firstWordMatch) {
                const [, firstWord, remainder] = firstWordMatch;
                const completedWord = text.trim() + firstWord;
                console.log(`Completing broken word: "${text.trim()}" + "${firstWord}" = "${completedWord}"`);
                
                paragraphText += `*${completedWord}*`;
                
                if (remainder.trim()) {
                  nextSpan.textContent = remainder;
                } else {
                  i++;
                }
              } else {
                paragraphText += hasItalicClass ? `*${text}*` : text;
              }
            } else {
              paragraphText += hasItalicClass ? `*${text}*` : text;
            }
          } else {
            paragraphText += text;
          }
        }
      }
      
      paragraphText = paragraphText.trim();
      if (paragraphText && paragraphText.length > 20) {
        processedParagraphs.push(paragraphText);
      }
    });
    
    const uniqueParagraphs = [...new Set(processedParagraphs)];
    const formattedText = uniqueParagraphs.join('\n\n');
    
    console.log('Found italic classes:', Array.from(italicClasses));
    console.log('Processed paragraphs:', uniqueParagraphs.length);
    console.log('Final formatted text:', formattedText.substring(0, 500) + '...');
    
    return formattedText;
  };

  return (
    <>
    <section className="min-h-screen md:fit-screen relative bg-jazz-grey">
      {!isLoading && content && imageLoaded && (
        <div 
          className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 animate-in"
          style={{ 
            backgroundImage: `url(${bioImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animationDelay: '500ms',
            animationDuration: '800ms',
            animationFillMode: 'forwards'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
      )}

      <div className="hidden md:block h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {!isLoading && content && (
            <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
              <h1 className="text-5xl font-bold text-purple-500 mb-6">Biography</h1>
              <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
            </div>
          )}

          {!isLoading && content ? (
            <div className="max-w-6xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
              <div className="flex gap-12 items-center">
                <div className="flex-1">
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="prose prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
                      {parseBiographyContent(content)}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 opacity-0 translate-x-4 animate-in" style={{ animationDelay: '1200ms' }}>
                  <img 
                    src={bioImagePath} 
                    alt="Joshua Mercado" 
                    className="w-80 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="md:hidden relative z-10 min-h-screen flex flex-col px-4 py-8 bg-[#101010]">
        {!isLoading && content && imageLoaded && (
          <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '1500ms' }}>
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Biography</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {!isLoading && content && imageLoaded ? (
            <div className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '2700ms' }}>
              <div className="bg-black bg-opacity-70 rounded-lg p-6 backdrop-blur-sm">
                <div className="prose prose-base max-w-none text-white leading-relaxed space-y-6">
                  {parseBiographyContent(content)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
    
    <div className="md:hidden">
      <Footer />
    </div>
    </>
  );
}
