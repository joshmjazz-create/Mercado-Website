// Updated for GitHub Pages deployment - using relative asset paths
const bgImage = "/assets/Screenshot_20250820_160009_Gallery_1755720047192.jpg";

export default function Home() {
  return (
    <section className="relative min-h-screen md:h-full flex items-center justify-center bg-gray-800 md:bg-gray-700">
      <div 
        className="absolute inset-0 opacity-0 animate-[slide-in-right_0.8s_ease-out_forwards] bg-cover md:bg-[length:125%] bg-[center_top] bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          animationDelay: '0ms'
        }}
      />
      
      {/* Desktop gradient overlay */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-700 opacity-60"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-8xl font-bold font-display text-purple-400 mb-8 drop-shadow-lg opacity-0 scale-95 animate-in" style={{ 
          animationDelay: '1500ms',
          animationDuration: '1200ms'
        }}>
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