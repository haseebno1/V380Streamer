import { useQuery } from "@tanstack/react-query";
import { Camera, Video, Check, X, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatusOverview() {
  const { data: cameras, isLoading } = useQuery({
    queryKey: ['/api/cameras'],
  });

  if (isLoading) {
    return <StatusOverviewSkeleton />;
  }

  // Calculate statistics
  const totalCameras = cameras?.length || 0;
  const onlineCameras = cameras?.filter(camera => camera.isOnline).length || 0;
  const offlineCameras = totalCameras - onlineCameras;
  const recordingCameras = cameras?.filter(camera => camera.isRecording).length || 0;

  const stats = [
    {
      name: "Total Cameras",
      value: totalCameras,
      icon: Camera,
      color: "text-slate-400"
    },
    {
      name: "Online",
      value: onlineCameras,
      icon: Check,
      color: "text-green-500"
    },
    {
      name: "Offline",
      value: offlineCameras,
      icon: X,
      color: "text-red-500"
    },
    {
      name: "Recording",
      value: recordingCameras,
      icon: Clock,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-500">{stat.name}</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusOverviewSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="ml-5 w-0 flex-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
