import { Link } from "wouter";
import { Calendar, Mail } from "lucide-react";

export default function Home() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-jazz-dark to-black">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Joshua <span className="text-jazz-yellow">Mercado</span>
        </h1>
        <h2 className="text-2xl md:text-3xl text-jazz-purple-light font-light mb-8">
          Professional Jazz Musician & Composer
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Bringing soulful jazz performances to life through trumpet and piano. 
          Experience the rich harmonies and improvisational magic of contemporary jazz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/schedule">
            <button className="bg-jazz-purple hover:bg-jazz-purple-light text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 shadow-lg flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              View Upcoming Shows
            </button>
          </Link>
          <Link href="/contact">
            <button className="border-2 border-jazz-yellow hover:bg-jazz-yellow hover:text-black text-jazz-yellow px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              Book Performance
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
