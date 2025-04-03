import { useState, useEffect, useRef } from "react";
import { Recording, Camera } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume, 
  Volume2, 
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaybackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recording: Recording | null;
}

export default function PlaybackModal({ 
  open, 
  onOpenChange, 
  recording 
}: PlaybackModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Fetch camera info to display camera name
  const { data: cameras } = useQuery<Camera[]>({
    queryKey: ['/api/cameras'],
    enabled: open && recording !== null
  });
  
  const cameraName = cameras?.find(c => c.id === recording?.cameraId)?.name || `Camera ${recording?.cameraId}`;
  
  // Format recording duration to readable format
  const recordingDuration = recording?.endTime && recording?.startTime
    ? formatDistance(new Date(recording.endTime), new Date(recording.startTime))
    : "Unknown";
  
  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };
  
  // Handle video seeking
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    const seekTime = value[0];
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(err => {
        toast({
          title: "Fullscreen Error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Handle download
  const handleDownload = async () => {
    if (!recording) return;
    
    try {
      setIsLoading(true);
      
      // API call would happen here
      const response = await fetch(`/api/recordings/${recording.id}/download`);
      if (!response.ok) {
        throw new Error("Failed to download recording");
      }
      
      // In a real implementation, this would trigger a file download
      // For demo purposes, we just show a success message
      
      toast({
        title: "Download Started",
        description: `${recording.filename} is being downloaded.`
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download recording",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a placeholder image for the recording
  function getPlaceholderImage(): string {
    if (!recording) return "";
    
    // In a real implementation, this would be the actual recording thumbnail
    // For demo purposes, we're returning placeholder images
    return `https://picsum.photos/seed/${recording.id}/800/450`;
  }
  
  // Set up video playback when recording changes
  useEffect(() => {
    if (!open || !recording) return;
    
    const setupVideo = async () => {
      setIsLoading(true);
      setIsPlaying(false);
      setCurrentTime(0);
      
      try {
        // In a real implementation, we would load the actual recording
        // For demo purposes, we just show a placeholder
        
        if (videoRef.current) {
          videoRef.current.poster = getPlaceholderImage();
          
          // Set some default values
          videoRef.current.volume = volume;
          videoRef.current.muted = isMuted;
          
          // Wait a bit to simulate loading
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsLoading(false);
        }
      } catch (error) {
        toast({
          title: "Playback Error",
          description: "Failed to load recording",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    setupVideo();
  }, [open, recording, toast, volume, isMuted]);
  
  // Update time values when video plays
  useEffect(() => {
    if (!videoRef.current) return;
    
    const onTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };
    
    const onDurationChange = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };
    
    const onPlay = () => {
      setIsPlaying(true);
    };
    
    const onPause = () => {
      setIsPlaying(false);
    };
    
    const onVolumeChange = () => {
      if (videoRef.current) {
        setVolume(videoRef.current.volume);
        setIsMuted(videoRef.current.muted);
      }
    };
    
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    // Add event listeners
    videoRef.current.addEventListener("timeupdate", onTimeUpdate);
    videoRef.current.addEventListener("durationchange", onDurationChange);
    videoRef.current.addEventListener("play", onPlay);
    videoRef.current.addEventListener("pause", onPause);
    videoRef.current.addEventListener("volumechange", onVolumeChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    
    // Clean up
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", onTimeUpdate);
        videoRef.current.removeEventListener("durationchange", onDurationChange);
        videoRef.current.removeEventListener("play", onPlay);
        videoRef.current.removeEventListener("pause", onPause);
        videoRef.current.removeEventListener("volumechange", onVolumeChange);
      }
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h,
      m > 9 ? m : `0${m}`,
      s > 9 ? s : `0${s}`
    ].filter((a, i) => a !== 0 || i > 0).join(":");
  };
  
  // Get appropriate volume icon
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume size={20} />;
    return <Volume2 size={20} />;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{recording?.filename || "Recording Playback"}</DialogTitle>
          <DialogDescription>
            {recording && (
              <>
                <span className="font-semibold">{cameraName}</span> • {recordingDuration} duration
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative rounded-md overflow-hidden bg-black aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            poster={recording ? getPlaceholderImage() : undefined}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity group-hover:opacity-100">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-1">
                <div className="text-white text-xs w-12">
                  {formatTime(currentTime)}
                </div>
                
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                
                <div className="text-white text-xs w-12 text-right">
                  {duration ? formatTime(duration) : "--:--"}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, currentTime - 10);
                      }
                    }}
                  >
                    <SkipBack size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-white"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                      }
                    }}
                  >
                    <SkipForward size={18} />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white"
                      onClick={toggleMute}
                    >
                      {getVolumeIcon()}
                    </Button>
                    
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white"
                    onClick={handleDownload}
                  >
                    <Download size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white"
                    onClick={toggleFullscreen}
                  >
                    <Maximize size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}