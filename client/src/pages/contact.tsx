import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Contact</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Information */}
          <Card className="shadow-xl border-0 overflow-hidden mb-16">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-center">
                  <div className="bg-purple-800 text-white p-3 rounded-lg mb-2 sm:mb-0 sm:mr-4">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-purple-800">Email</p>
                    <p className="text-gray-600 text-lg">joshm.jazz@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center">
                  <div className="bg-purple-800 text-white p-3 rounded-lg mb-2 sm:mb-0 sm:mr-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-purple-800">Phone</p>
                    <p className="text-gray-600 text-lg">(407) 276-0739</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Social Media Icons at Bottom */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-6">Follow me on social media</p>
          <div className="flex justify-center space-x-8">
            <a 
              href="#" 
              className="text-[#1877F2] hover:opacity-80 transition-opacity duration-300"
              aria-label="Facebook"
            >
              <FaFacebook className="w-10 h-10" />
            </a>
            <a 
              href="#" 
              className="text-[#E4405F] hover:opacity-80 transition-opacity duration-300"
              aria-label="Instagram"
            >
              <FaInstagram className="w-10 h-10" />
            </a>
            <a 
              href="#" 
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