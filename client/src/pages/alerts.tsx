import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, Camera } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FaCheck, FaBell, FaCamera, FaVideo, FaExclamationTriangle, FaCog } from "react-icons/fa";

export default function Alerts() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  // Fetch all cameras to display camera names
  const camerasQuery = useQuery({
    queryKey: ["/api/cameras"]
  });
  
  // Create a camera name map from the query results
  const cameraMap = React.useMemo(() => {
    if (!camerasQuery.data) return {};
    
    return (camerasQuery.data as Camera[]).reduce((acc, camera) => {
      acc[camera.id] = camera.name;
      return acc;
    }, {} as Record<number, string>);
  }, [camerasQuery.data]);
  
  // Fetch alerts based on active tab
  const read = activeTab === "read" ? true : activeTab === "unread" ? false : undefined;
  const alertsQuery = useQuery({
    queryKey: ["/api/alerts", read],
    queryFn: async () => {
      const url = new URL("/api/alerts", window.location.origin);
      if (read !== undefined) {
        url.searchParams.append("read", String(read));
      }
      return apiRequest('GET', url.toString());
    }
  });
  
  // Mark a single alert as read
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest('PUT', `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert marked as read",
        description: "The alert has been marked as read successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark alert as read. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mark all alerts as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', "/api/alerts/mark-all-read");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "All alerts marked as read",
        description: `${data.count || 'All'} alerts have been marked as read.`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all alerts as read. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete an alert
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest('DELETE', `/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert deleted",
        description: "The alert has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "motion":
        return <FaExclamationTriangle className="text-amber-500" />;
      case "offline":
        return <FaCamera className="text-red-500" />;
      case "storage":
        return <FaVideo className="text-blue-500" />;
      case "system":
        return <FaCog className="text-purple-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };
  
  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case "motion":
        return <Badge className="bg-amber-500">Motion</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      case "storage":
        return <Badge variant="secondary">Storage</Badge>;
      case "system":
        return <Badge variant="outline">System</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark All as Read
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            View and manage alerts from your surveillance system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {alertsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : alertsQuery.isError ? (
                <div className="text-center p-4">
                  <p className="text-destructive">Failed to load alerts. Please try again.</p>
                </div>
              ) : alertsQuery.data?.length === 0 ? (
                <div className="text-center p-6">
                  <p className="text-muted-foreground text-lg">No alerts found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Camera</TableHead>
                      <TableHead className="w-[180px]">Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsQuery.data?.map((alert: Alert) => (
                      <TableRow key={alert.id} className={!alert.read ? "bg-muted/30" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getAlertIcon(alert.type)}
                            {getAlertTypeBadge(alert.type)}
                          </div>
                        </TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          {cameraMap[alert.cameraId] || `Camera ${alert.cameraId}`}
                        </TableCell>
                        <TableCell>
                          {format(new Date(alert.timestamp), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsReadMutation.mutate(alert.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                <FaCheck className="mr-1 h-4 w-4" />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAlertMutation.mutate(alert.id)}
                              disabled={deleteAlertMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}