"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;

    emailjs
      .sendForm(
        "default_service",          // EmailJS service ID (keep default if using Gmail via EmailJS)
        "template_hm36im4",         // ✅ Your template ID
        form.current,
        "f3l713gprTCuwWXc9"         // ✅ Your public key
      )
      .then(
        () => {
          setStatus("success");
          form.current?.reset();
        },
        () => {
          setStatus("error");
        }
      );
  };

  return (
    <>
      <section className="min-h-screen bg-jazz-grey">
        <div className="container mx-auto px-4 py-16 w-full">
          <div
            className="text-center mb-12 opacity-0 translate-y-4 animate-in"
            style={{ animationDelay: "200ms" }}
          >
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Contact</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>

          {/* Contact Form */}
          <div
            className="max-w-2xl mx-auto mb-12 opacity-0 translate-y-4 animate-in"
            style={{ animationDelay: "400ms" }}
          >
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-10 bg-white">
                <form ref={form} onSubmit={sendEmail} className="space-y-6">
                  <div>
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      name="user_name"
                      required
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Email</label>
                    <input
                      type="email"
                      name="user_email"
                      required
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Your Message</label>
                    <textarea
                      name="message"
                      rows={6}
                      required
                      className="w-full p-3 border rounded-lg"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-lg transition-colors duration-300"
                  >
                    Send Message
                  </button>
                  {status === "success" && (
                    <p className="text-green-600 text-center mt-4">
                      ✅ Message sent successfully!
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-red-600 text-center mt-4">
                      ❌ Failed to send. Try again later.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Existing Contact Info (smaller below form) */}
          <div
            className="max-w-2xl mx-auto text-sm text-gray-700 space-y-8 opacity-0 translate-y-4 animate-in"
            style={{ animationDelay: "600ms" }}
          >
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

          {/* Social Links */}
          <div
            className="text-center pt-8 border-t border-gray-200 opacity-0 translate-y-4 animate-in"
            style={{ animationDelay: "800ms" }}
          >
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

      <div className="md:hidden">
        <Footer />
      </div>
    </>
  );
}
