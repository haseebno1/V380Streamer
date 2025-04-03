import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCard, CameraCardSkeleton } from "@/components/dashboard/camera-card";
import { Camera } from "@shared/schema";

export default function LiveStreams() {
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: cameras, isLoading, error } = useQuery<Camera[]>({
    queryKey: ['/api/cameras'],
  });

  // Filter cameras based on active tab
  const filteredCameras = cameras?.filter(camera => {
    if (activeTab === "all") return true;
    if (activeTab === "online") return camera.isOnline;
    if (activeTab === "offline") return !camera.isOnline;
    if (activeTab === "recording") return camera.isRecording;
    return true;
  });

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Live Streams</h1>
        <p className="mt-2 text-sm text-slate-500">View and manage all your camera streams in one place.</p>
      </div>
      
      <div className="px-4 sm:px-6 md:px-8 mt-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Cameras</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="recording">Recording</TabsTrigger>
              <TabsTrigger value="offline">Offline</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4].map((key) => (
                  <CameraCardSkeleton key={key} />
                ))}
              </div>
            ) : error ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-red-500">Failed to load cameras. Please try again.</p>
                </div>
              </Card>
            ) : filteredCameras?.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-slate-500">No cameras found for the selected filter.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCameras?.map((camera) => (
                  <CameraCard
                    key={camera.id}
                    camera={camera}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
