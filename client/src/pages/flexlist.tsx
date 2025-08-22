import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Download } from "lucide-react";
import flexListLogo from "@assets/file_00000000293061f5b6c62d71c7ed0c97_1755824354993.png";

export default function FlexList() {
  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <img 
              src={flexListLogo} 
              alt="FlexList Logo" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-blue-400 mb-4">FlexList</h1>
          <p className="text-xl text-gray-300 mb-8">
            The ultimate music practice companion
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Organize your music practice sessions, track your progress, and stay motivated 
            with FlexList - the app designed specifically for musicians like you.
          </p>
        </div>

        {/* Download Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Download FlexList</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* iOS Download */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Smartphone className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">iOS</h3>
                  <p className="text-gray-400">Available on the App Store</p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download for iOS
                </Button>
                <p className="text-sm text-gray-500 mt-2">Coming soon</p>
              </CardContent>
            </Card>

            {/* Android Download */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Smartphone className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Android</h3>
                  <p className="text-gray-400">Available on Google Play</p>
                </div>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download for Android
                </Button>
                <p className="text-sm text-gray-500 mt-2">Coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Key Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Practice Lists</h3>
              <p className="text-gray-400">Create and organize your practice sessions with customizable lists</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎵</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Music Integration</h3>
              <p className="text-gray-400">Seamlessly integrate with your music library and practice routines</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>
              <p className="text-gray-400">Monitor your practice progress and stay motivated</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center">
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400">
              FlexList is currently in development. Download links will be available soon for both iOS and Android platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}