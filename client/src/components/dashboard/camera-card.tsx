import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Link as LinkIcon, 
  Volume2, 
  Play, 
  Settings, 
  Check, 
  Clock 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import VideoPlayer from "@/components/ui/video-player";

interface CameraCardProps {
  camera: Camera;
}

export function CameraCard({ camera }: CameraCardProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(camera.isOnline);
  const [isRecording, setIsRecording] = useState(camera.isRecording);
  const [quality, setQuality] = useState(camera.streamQuality);

  // Handle toggling recording state
  const toggleRecording = async () => {
    if (!camera.isOnline) return;

    try {
      const newRecordingState = !isRecording;
      await apiRequest("PUT", `/api/cameras/${camera.id}/status`, {
        isOnline: true,
        isRecording: newRecordingState
      });
      
      setIsRecording(newRecordingState);
      queryClient.invalidateQueries({ queryKey: ['/api/cameras'] });
      
      toast({
        title: newRecordingState ? "Recording Started" : "Recording Stopped",
        description: `${camera.name} is ${newRecordingState ? "now recording" : "no longer recording"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle recording state",
        variant: "destructive",
      });
    }
  };

  // Handle changing stream quality
  const changeQuality = async (newQuality: string) => {
    try {
      await apiRequest("PUT", `/api/cameras/${camera.id}`, {
        ...camera,
        streamQuality: newQuality
      });
      
      setQuality(newQuality);
      queryClient.invalidateQueries({ queryKey: ['/api/cameras'] });
      
      toast({
        title: "Quality Changed",
        description: `Stream quality updated to ${newQuality}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change stream quality",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${isRecording ? "recording" : ""}`}>
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 bg-slate-800">
          {camera.isOnline ? (
            <VideoPlayer
              url={camera.rtspUrl}
              username={camera.username}
              password={camera.password}
              isPlaying={isPlaying}
              quality={quality}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center p-4">
              <div>
                <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto" />
                <p className="mt-2 text-sm text-slate-400">Connection lost</p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2 flex space-x-2">
          {camera.isOnline ? (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-md font-medium">Online</span>
          ) : (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-md font-medium">Offline</span>
          )}
          {isRecording && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-md font-medium record-indicator">
              Recording
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-slate-900">{camera.name}</h3>
        <div className="mt-2 flex items-center text-sm text-slate-500">
          <LinkIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
          <span className="font-mono text-xs overflow-hidden text-ellipsis">{camera.rtspUrl}</span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Select
              value={quality}
              onValueChange={changeQuality}
              disabled={!camera.isOnline}
            >
              <SelectTrigger className="h-8 text-xs mr-2 w-28">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">HD (1080p)</SelectItem>
                <SelectItem value="medium">SD (720p)</SelectItem>
                <SelectItem value="low">Low (480p)</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-500">
              {camera.isOnline ? (quality === "high" ? "2.1 Mbps" : quality === "medium" ? "1.5 Mbps" : "0.8 Mbps") : "0.0 Mbps"}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`p-2 rounded-full ${camera.isOnline 
                ? "text-slate-400 hover:text-slate-500 hover:bg-slate-100" 
                : "text-slate-300 cursor-not-allowed"}`}
              disabled={!camera.isOnline}
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <button 
              className={`p-2 rounded-full ${camera.isOnline 
                ? (isRecording 
                  ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" 
                  : "text-slate-400 hover:text-orange-500 hover:bg-orange-50") 
                : "text-slate-300 cursor-not-allowed"}`}
              onClick={toggleRecording}
              disabled={!camera.isOnline}
            >
              <Play className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-500 hover:bg-slate-100">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CameraCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 bg-slate-200 animate-pulse" />
      </div>
      
      <div className="p-4">
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-8 w-28 mr-2" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
