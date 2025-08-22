import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Download } from "lucide-react";
// Use direct path for compatibility
const flexListLogo = "/assets/file_00000000293061f5b6c62d71c7ed0c97_1755824354993.png";

export default function FlexList() {
  return (
    <div className="min-h-screen bg-slate-800 text-white" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
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
          <h2 className="text-3xl font-normal text-white mb-8">Download FlexList</h2>
          
          <div className="max-w-md mx-auto">
            {/* Android Download */}
            <Card className="bg-slate-700 border-slate-600 animate-in slide-in-from-bottom-6 duration-700 delay-1100">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Smartphone className="w-16 h-16 text-teal-400 mx-auto mb-4" />
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
          </div>
        </div>

        {/* iOS Notice */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-600 delay-1300">
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-normal text-white mb-2">Sorry iOS Users</h3>
            <p className="text-gray-400 font-normal">
              Unfortunately, it's too time consuming to get FlexList working on Apple devices. The app is currently only available for Android.
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}