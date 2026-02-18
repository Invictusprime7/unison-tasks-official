import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a12] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="text-center relative z-10">
        <div className="relative mb-6">
          <AlertTriangle className="h-20 w-20 text-red-400 mx-auto drop-shadow-[0_0_30px_rgba(255,0,0,0.5)] animate-pulse" />
        </div>
        <h1 className="mb-4 text-7xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,0,0,0.3)]">
          4<span className="text-red-400">0</span>4
        </h1>
        <p className="mb-6 text-xl text-gray-400">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-200 active:scale-95"
        >
          <Home className="h-5 w-5" />
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
