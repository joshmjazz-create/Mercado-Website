import { Music, Award, GraduationCap, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Bio() {
  const achievements = [
    "Featured performer at Chicago Jazz Festival 2023",
    "Winner of Downtown Jazz Competition 2022", 
    "Recording artist with 3 studio albums",
    "Resident musician at Blue Note Jazz Club"
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-jazz-dark mb-4">About Joshua</h2>
          <div className="w-24 h-1 bg-jazz-blue mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-jazz-dark mb-4 flex items-center gap-3">
                  <Music className="text-jazz-green" />
                  Musical Journey
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Joshua Mercado began his musical journey at the age of 8, first discovering his passion for music through the trumpet. His dedication to the craft led him to master both trumpet and piano, developing a unique style that blends traditional jazz with contemporary influences.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  With over 15 years of professional performance experience, Joshua has graced stages from intimate jazz clubs to major concert halls, captivating audiences with his soulful interpretations and masterful improvisations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-jazz-dark mb-4 flex items-center gap-3">
                  <Award className="text-jazz-blue" />
                  Achievements
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {achievements.map((achievement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="text-jazz-blue-light w-5 h-5 flex-shrink-0" />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional jazz trumpeter performing" 
              className="rounded-xl shadow-lg w-full h-auto" 
            />
            
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-jazz-dark mb-4 flex items-center gap-3">
                  <GraduationCap className="text-jazz-green" />
                  Education & Training
                </h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-jazz-dark">Master of Music, Jazz Performance</h4>
                    <p className="text-sm text-gray-600">Berklee College of Music, Boston</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-jazz-dark">Bachelor of Arts, Music Composition</h4>
                    <p className="text-sm text-gray-600">New England Conservatory</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
