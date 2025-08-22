import bgImage from "@assets/Screenshot_20250820_160009_Gallery_1755720047192.jpg";

export default function Home() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-jazz-dark to-black">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40" 
        style={{
          backgroundImage: `url(${bgImage})`
        }}
      />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-8xl font-bold font-display text-purple-400 mb-8 drop-shadow-lg opacity-0 scale-95 animate-in" style={{ 
          animationDelay: '200ms',
          animationDuration: '800ms'
        }}>
          Joshua Mercado
        </h1>
        <h2 className="text-3xl md:text-4xl text-white font-light drop-shadow-lg opacity-0 translate-y-4 animate-in" style={{ 
          animationDelay: '800ms',
          animationDuration: '600ms'
        }}>
          Trumpet & Composition
        </h2>
      </div>
    </section>
  );
}
