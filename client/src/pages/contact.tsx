import { useState } from "react";
import Footer from "@/components/footer";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    date: "",
    message: ""
  });

// Update document title
  useEffect(() => {
    document.title = "Contact";
  }, []);
  
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure all fields are filled
    const allFilled = Object.values(formData).every(value => value.trim() !== "");
    if (!allFilled) {
      alert("Please fill in all fields before sending.");
      return;
    }

    setSending(true);

    try {
      await emailjs.send(
        "service_p6hxlqn",
        "template_hm36im4",
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          date: formData.date,
          message: formData.message
        },
        "f3l713gprTCuwWXc9"
      );
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", date: "", message: "" });
    } catch (error) {
      console.error("EmailJS send error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-jazz-grey">
        <div className="container mx-auto px-4 py-16 w-full">
          <div className="text-center mb-12 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Contact</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: "400ms" }}>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-10 rounded-lg shadow-xl">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 rounded-lg transition-colors"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>

            {/* Left-aligned Email Info */}
            <div className="mt-6 text-left">
              <p className="text-purple-500 text-sm font-semibold">Contact Joshua Mercado</p>
              <a href="mailto:joshm.jazz@gmail.com" className="text-gray-700 text-sm underline">
                joshm.jazz@gmail.com
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
