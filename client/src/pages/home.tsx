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
        <h1 className="text-5xl md:text-7xl font-bold font-display text-purple-400 mb-6 drop-shadow-lg opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          Joshua <span className="text-purple-400">Mercado</span>
        </h1>
        <h2 className="text-2xl md:text-3xl text-white font-light mb-8 drop-shadow-lg opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
          Professional Jazz Musician & Composer
        </h2>
        <p className="text-xl text-white mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg opacity-0 translate-y-4 animate-in" style={{ animationDelay: '600ms' }}>
          Bringing soulful jazz performances to life through trumpet and piano. 
          Experience the rich harmonies and improvisational magic of contemporary jazz.
        </p>
        

      </div>
    </section>
  );
}
