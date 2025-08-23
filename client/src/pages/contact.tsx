import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <section className="min-h-screen md:h-full bg-jazz-grey md:overflow-y-auto md:flex md:items-center">
      <div className="container mx-auto px-4 py-8 w-full" style={{ transform: 'translateY(-2in)' }}>
        <div className="text-center mb-12 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Contact</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        <div className="max-w-2xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
          {/* Contact Information */}
          <Card className="shadow-xl border-0 overflow-hidden mb-12">
            <CardContent className="p-10">
              <div className="space-y-12">
                <div className="flex flex-col sm:flex-row items-center justify-center">
                  <a 
                    href="mailto:joshm.jazz@gmail.com"
                    className="bg-purple-500 hover:bg-purple-400 text-white p-3 rounded-lg mb-2 sm:mb-0 sm:mr-4 transition-colors duration-300 cursor-pointer"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <div className="text-center">
                    <p className="font-semibold text-purple-500">Email</p>
                    <p className="text-gray-800 text-lg">joshm.jazz@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center">
                  <a 
                    href="tel:+14072760739"
                    className="bg-purple-500 hover:bg-purple-400 text-white p-3 rounded-lg mb-2 sm:mb-0 sm:mr-4 transition-colors duration-300 cursor-pointer"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <div className="text-center">
                    <p className="font-semibold text-purple-500">Phone</p>
                    <p className="text-gray-800 text-lg">(407) 276-0739</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Social Media Icons at Bottom */}
        <div className="text-center pt-8 border-t border-gray-200 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '600ms' }}>
          <p className="text-gray-800 mb-6">Follow me on social media</p>
          <div className="flex justify-center space-x-8">
            <a 
              href="https://www.facebook.com/share/19eJ712nF4/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1877F2] hover:opacity-80 transition-opacity duration-300"
              aria-label="Facebook"
            >
              <FaFacebook className="w-10 h-10" />
            </a>
            <a 
              href="https://www.instagram.com/josh.m_music?igsh=MWtlZmZlZDQ5enZtMQ==" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E4405F] hover:opacity-80 transition-opacity duration-300"
              aria-label="Instagram"
            >
              <FaInstagram className="w-10 h-10" />
            </a>
            <a 
              href="https://youtube.com/@joshm.music_?si=6rdyKqF43CHNXqDY" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:opacity-80 transition-opacity duration-300"
              aria-label="YouTube"
            >
              <FaYoutube className="w-10 h-10" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}