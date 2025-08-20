import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-jazz-yellow mb-4">Joshua Mercado</h3>
          <p className="text-gray-400 mb-6">Professional Jazz Musician & Composer</p>
          
          <div className="flex justify-center space-x-6 mb-8">
            <Link href="/" className="text-gray-400 hover:text-jazz-purple-light transition-colors duration-300">Home</Link>
            <Link href="/bio" className="text-gray-400 hover:text-jazz-purple-light transition-colors duration-300">Bio</Link>
            <Link href="/gallery" className="text-gray-400 hover:text-jazz-purple-light transition-colors duration-300">Gallery</Link>
            <Link href="/schedule" className="text-gray-400 hover:text-jazz-purple-light transition-colors duration-300">Schedule</Link>
            <Link href="/contact" className="text-gray-400 hover:text-jazz-purple-light transition-colors duration-300">Contact</Link>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">
              © 2024 Joshua Mercado. All rights reserved. | 
              <span className="text-jazz-yellow ml-1">Bringing Jazz to Life</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}