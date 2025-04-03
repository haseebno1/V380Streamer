import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  url: string;
  username?: string;
  password?: string;
  isPlaying: boolean;
  quality: string;
}

export default function VideoPlayer({ url, username, password, isPlaying, quality }: VideoPlayerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hlsInstance: any = null;
    
    const setupPlayer = async () => {
      if (!videoRef.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        if (!isPlaying) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          setIsLoading(false);
          return;
        }
        
        // In a real implementation, we would use an actual HLS.js or similar library here
        // For demo purposes, we're showing a simulated implementation
        
        // Simulate stream connection
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get stream from backend
        const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&username=${encodeURIComponent(username || '')}&password=${encodeURIComponent(password || '')}&quality=${quality}`;
        
        // In a real implementation, we would connect to the stream here
        // For demo purposes, we're just simulating a successful connection
        
        // Simulate successful connection
        if (videoRef.current) {
          // This would be an actual video stream in a real implementation
          videoRef.current.poster = getPlaceholderImage();
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Video player error:", err);
        setError("Failed to connect to stream");
        setIsLoading(false);
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to camera stream",
          variant: "destructive",
        });
      }
    };
    
    setupPlayer();
    
    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [url, username, password, isPlaying, quality, toast]);

  // Generate a placeholder image based on the camera name
  function getPlaceholderImage(): string {
    // In a real implementation, this would be the actual video stream
    // For demo purposes, we're returning placeholder images
    // These will be replaced with actual stream data in production
    return `https://picsum.photos/seed/${url.replace(/[^a-zA-Z0-9]/g, '')}/800/450`;
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white">
          <div className="text-center">
            <p>{error}</p>
            <button 
              className="mt-2 px-3 py-1 bg-blue-600 rounded-md text-sm hover:bg-blue-700"
              onClick={() => setError(null)}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <video 
        ref={videoRef}
        className={`w-full h-full object-cover ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
        autoPlay
        muted
        playsInline
      ></video>
    </div>
  );
}
