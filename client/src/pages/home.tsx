// Updated for GitHub Pages deployment - using relative asset paths
const bgImageMobile = "/assets/Screenshot_20250820_160009_Gallery_1755720047192.jpg";
const bgImageDesktop = "/assets/Another_Screenshot_1755918412460.jpg";

export default function Home() {
  return (
    <section className="relative min-h-screen md:h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#101010' }}>
      {/* Mobile: Background Image */}
      <div 
        className="md:hidden absolute inset-0 opacity-0 animate-[slide-in-right_0.8s_ease-out_forwards] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImageMobile})`,
          animationDelay: '0ms'
        }}
      />
      
      {/* Desktop: Actual Image Element */}
      <img 
        src={bgImageDesktop}
        alt="Background"
        className="hidden md:block absolute opacity-0 animate-[slide-in-right_0.8s_ease-out_forwards] object-cover"
        style={{
          animationDelay: '0ms',
          height: '100vh',
          width: 'auto',
          right: '0',
          top: '0',
          zIndex: 1
        }}
      />
      

      
      <div className="relative text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>
        <h1 className="text-6xl md:text-8xl font-bold font-display text-purple-500 mb-8 drop-shadow-lg opacity-0 scale-95 animate-in" style={{ 
          animationDelay: '1500ms',
          animationDuration: '1200ms',
          WebkitTextStroke: '1px rgba(124, 45, 210, 0.4)'
        } as React.CSSProperties}>
          Joshua Mercado
        </h1>
        <h2 className="text-3xl md:text-4xl text-white font-light drop-shadow-lg opacity-0 translate-y-4 animate-in" style={{ 
          animationDelay: '2700ms',
          animationDuration: '1000ms'
        }}>
          Trumpet & Composition
        </h2>
      </div>
    </section>
  );
}