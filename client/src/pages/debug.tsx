import { useEffect, useState } from "react";

export default function Debug() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check environment variables
    const vars: Record<string, string> = {};
    vars.NODE_ENV = import.meta.env.NODE_ENV || 'undefined';
    vars.MODE = import.meta.env.MODE || 'undefined';
    vars.VITE_GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ? 'present' : 'missing';
    vars.VITE_GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID ? 'present' : 'missing';
    vars.VITE_BIOGRAPHY_DOC_ID = import.meta.env.VITE_BIOGRAPHY_DOC_ID ? 'present' : 'missing';
    vars.VITE_PHOTOS_FOLDER_ID = import.meta.env.VITE_PHOTOS_FOLDER_ID ? 'present' : 'missing';
    vars.VITE_MUSIC_FOLDER_ID = import.meta.env.VITE_MUSIC_FOLDER_ID ? 'present' : 'missing';
    
    setEnvVars(vars);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">Debug Page</h1>
        
        <div className="bg-black/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-mono text-sm">{key}:</span>
                <span className={`font-mono text-sm ${value === 'missing' ? 'text-red-400' : 'text-green-400'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Build Info</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Build Time:</span>
              <span className="font-mono text-sm">{new Date().toISOString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>User Agent:</span>
              <span className="font-mono text-sm text-xs">{navigator.userAgent}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Status</h2>
          <div className="text-green-400">
            ✅ React app is rendering correctly
            <br />
            ✅ Styling is loading properly
            <br />
            ✅ Client-side JavaScript is executing
          </div>
        </div>
      </div>
    </div>
  );
}