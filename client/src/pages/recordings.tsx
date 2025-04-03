import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Recording, Camera } from "@shared/schema";
import { 
  Calendar, 
  Download, 
  Trash2, 
  FileVideo, 
  Save,
  Search, 
  Filter,
  CalendarDays
} from "lucide-react";
import { format, formatDistance, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import PlaybackModal from "@/components/recordings/playback-modal";

export default function Recordings() {
  const { toast } = useToast();
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [playbackOpen, setPlaybackOpen] = useState<boolean>(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  
  const { data: recordings, isLoading: recordingsLoading } = useQuery<Recording[]>({
    queryKey: ['/api/recordings', selectedCamera],
    queryFn: async () => {
      const url = selectedCamera 
        ? `/api/recordings?cameraId=${selectedCamera}` 
        : '/api/recordings';
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error('Failed to fetch recordings');
      }
      
      return res.json();
    }
  });
  
  const { data: cameras, isLoading: camerasLoading } = useQuery<Camera[]>({
    queryKey: ['/api/cameras'],
  });
  
  // Function to open playback modal with selected recording
  const openPlayback = (recording: Recording) => {
    setSelectedRecording(recording);
    setPlaybackOpen(true);
  };
  
  // Filter recordings based on search term and date range
  const filteredRecordings = recordings?.filter(recording => {
    let matches = true;
    
    // Apply search filter if search term exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const cameraName = cameras?.find(c => c.id === recording.cameraId)?.name || '';
      matches = matches && (
        recording.filename.toLowerCase().includes(searchLower) ||
        cameraName.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply date range filter if date range exists
    if (dateRange?.from) {
      const recordingDate = new Date(recording.startTime);
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      matches = matches && recordingDate >= fromDate;
    }
    
    if (dateRange?.to) {
      const recordingDate = new Date(recording.startTime);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matches = matches && recordingDate <= toDate;
    }
    
    return matches;
  });

  // Function to delete a recording
  const deleteRecording = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/recordings/${id}`, undefined);
      
      toast({
        title: "Recording deleted",
        description: "The recording has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/recordings'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recording",
        variant: "destructive",
      });
    }
  };

  // Format file size to readable format
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "Unknown";
    
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Recordings</h1>
        <p className="mt-2 text-sm text-slate-500">
          View and manage all your camera recordings.
        </p>
      </div>
      
      <div className="px-4 sm:px-6 md:px-8 mt-6">
        <Card>
          <CardHeader className="flex flex-col space-y-1.5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Recording History</CardTitle>
              <CardDescription>
                Manage all your saved camera recordings
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Camera: {selectedCamera ? (cameras?.find(c => c.id === selectedCamera)?.name || 'Loading...') : 'All'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Camera</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCamera(null)}>
                    All Cameras
                  </DropdownMenuItem>
                  {cameras?.map((camera) => (
                    <DropdownMenuItem 
                      key={camera.id}
                      onClick={() => setSelectedCamera(camera.id)}
                    >
                      {camera.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range)}
                      numberOfMonths={2}
                    />
                    
                    <div className="mt-3 flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDateRange(undefined)}
                      >
                        Clear
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const today = new Date();
                          const sevenDaysAgo = subDays(today, 7);
                          setDateRange({
                            from: sevenDaysAgo,
                            to: today
                          });
                        }}
                      >
                        Last 7 Days
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search recordings..."
                  className="w-full pl-9 sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {recordingsLoading || camerasLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : recordings && recordings.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Camera</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {filteredRecordings?.map((recording, index) => {
                      const camera = cameras?.find(c => c.id === recording.cameraId);
                      const duration = recording.endTime
                        ? formatDistance(new Date(recording.endTime), new Date(recording.startTime))
                        : "In progress";
                      
                      return (
                        <TableRow key={recording.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{camera?.name || `Camera ${recording.cameraId}`}</TableCell>
                          <TableCell className="font-mono text-xs truncate max-w-[200px]" title={recording.filename}>{recording.filename}</TableCell>
                          <TableCell>{format(new Date(recording.startTime), 'MMM d, yyyy h:mm a')}</TableCell>
                          <TableCell>{duration}</TableCell>
                          <TableCell>{formatFileSize(recording.filesize)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openPlayback(recording)}
                              >
                                <FileVideo className="h-4 w-4 mr-2" />
                                Play
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await apiRequest('GET', `/api/recordings/${recording.id}/download`, undefined);
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
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteRecording(recording.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Save className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No recordings found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCamera
                    ? "No recordings found for the selected camera"
                    : searchTerm 
                      ? "No recordings match your search criteria" 
                      : dateRange?.from
                        ? "No recordings found in the selected date range"
                        : "Start recording from your cameras to see them here"
                  }
                </p>
              </div>
            )}
            
            {/* Playback Modal */}
            <PlaybackModal 
              open={playbackOpen} 
              onOpenChange={setPlaybackOpen} 
              recording={selectedRecording} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
