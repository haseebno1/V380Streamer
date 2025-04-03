import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { CameraCard, CameraCardSkeleton } from "@/components/dashboard/camera-card";
import { Camera } from "@shared/schema";

export default function Dashboard() {
  const { data: cameras, isLoading, error } = useQuery<Camera[]>({
    queryKey: ['/api/cameras'],
  });

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Camera Dashboard</h1>
      </div>
      
      <div className="px-4 sm:px-6 md:px-8">
        {/* Status Cards */}
        <StatusOverview />
        
        {/* Camera Grid */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Camera Feeds</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((key) => (
                <CameraCardSkeleton key={key} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-red-700">
                  <p>Failed to load cameras. Please try again.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cameras?.map((camera) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
