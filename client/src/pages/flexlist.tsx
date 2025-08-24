import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { FaApple, FaAndroid } from "react-icons/fa";

// Updated for GitHub Pages deployment - using relative asset paths
const flexListLogo = "./assets/file_00000000293061f5b6c62d71c7ed0c97_1755824354993.png";

export default function FlexList() {
  return (
    <div className="min-h-screen md:h-full bg-slate-800 text-white md:overflow-y-auto" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-8 flex justify-center animate-in fade-in duration-1000 delay-300">
            <img 
              src={flexListLogo} 
              alt="FlexList Logo" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-5xl font-normal text-blue-400 mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-500" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>FlexList</h1>
          <p className="text-xl text-gray-300 mb-8 font-normal animate-in slide-in-from-bottom-4 duration-700 delay-700">
            FlexList is an app that I made to help organize music based on<br className="hidden md:block" />
            <span className="md:hidden"> </span>knowledge level. Check it out if you're interested!
          </p>
        </div>

        {/* Download Section */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-6 duration-800 delay-900">
          <h2 className="text-3xl font-normal text-white mb-8">Access FlexList</h2>
          
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Android Download */}
            <Card className="bg-slate-700 border-slate-600 animate-in slide-in-from-bottom-6 duration-700 delay-1100">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <FaAndroid className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-normal text-white mb-2">Android</h3>
                  <p className="text-gray-400 font-normal">App under development</p>
                </div>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-normal"
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download for Android
                </Button>
              </CardContent>
            </Card>

            {/* iOS Web App */}
            <Card className="bg-slate-700 border-slate-600 animate-in slide-in-from-bottom-6 duration-700 delay-1200">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <FaApple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-normal text-white mb-2">iOS</h3>
                  <p className="text-gray-400 font-normal">Web app available</p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-normal"
                  onClick={() => window.open('https://joshmjazz-create.github.io/Flexlistz-Repo/', '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Open Web App
                </Button>
                <p className="text-xs text-gray-400 mt-3 font-normal">
                  This is a web app, not a downloadable app from the App Store
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}