import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Configure your camera surveillance system preferences.
        </p>
      </div>
      
      <div className="px-4 sm:px-6 md:px-8 mt-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="recording">Recording</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="application-name">Application Name</Label>
                    <Input id="application-name" defaultValue="CameraHub" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default-view">Default View</Label>
                    <Select defaultValue="dashboard">
                      <SelectTrigger id="default-view">
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="live-streams">Live Streams</SelectItem>
                        <SelectItem value="recordings">Recordings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-reconnect">Auto-reconnect Cameras</Label>
                      <p className="text-sm text-slate-500">
                        Automatically reconnect to cameras when connection is lost
                      </p>
                    </div>
                    <Switch id="auto-reconnect" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-slate-500">
                        Enable dark mode for the application interface
                      </p>
                    </div>
                    <Switch id="dark-mode" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recording">
            <Card>
              <CardHeader>
                <CardTitle>Recording Settings</CardTitle>
                <CardDescription>
                  Configure recording preferences and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-quality">Default Recording Quality</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="default-quality">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">HD (1080p)</SelectItem>
                        <SelectItem value="medium">SD (720p)</SelectItem>
                        <SelectItem value="low">Low (480p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file-format">File Format</Label>
                    <Select defaultValue="mp4">
                      <SelectTrigger id="file-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="mkv">MKV</SelectItem>
                        <SelectItem value="avi">AVI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="segment-length">Recording Segment Length</Label>
                    <Select defaultValue="15">
                      <SelectTrigger id="segment-length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Recordings longer than this will be split into multiple files
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="motion-detection">Enable Motion Detection</Label>
                      <p className="text-sm text-slate-500">
                        Only record when motion is detected
                      </p>
                    </div>
                    <Switch id="motion-detection" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="storage">
            <Card>
              <CardHeader>
                <CardTitle>Storage Settings</CardTitle>
                <CardDescription>
                  Configure storage locations and retention policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storage-path">Storage Path</Label>
                    <Input id="storage-path" defaultValue="/recordings" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storage-limit">Storage Limit</Label>
                    <Select defaultValue="50">
                      <SelectTrigger id="storage-limit">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 GB</SelectItem>
                        <SelectItem value="25">25 GB</SelectItem>
                        <SelectItem value="50">50 GB</SelectItem>
                        <SelectItem value="100">100 GB</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retention-policy">Retention Policy</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="retention-policy">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-delete">Auto-delete Old Recordings</Label>
                      <p className="text-sm text-slate-500">
                        Automatically delete recordings that exceed retention policy
                      </p>
                    </div>
                    <Switch id="auto-delete" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-offline">Camera Offline Notifications</Label>
                      <p className="text-sm text-slate-500">
                        Receive notifications when a camera goes offline
                      </p>
                    </div>
                    <Switch id="notify-offline" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-motion">Motion Detected Notifications</Label>
                      <p className="text-sm text-slate-500">
                        Receive notifications when motion is detected
                      </p>
                    </div>
                    <Switch id="notify-motion" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-storage">Storage Alerts</Label>
                      <p className="text-sm text-slate-500">
                        Receive notifications when storage is getting full
                      </p>
                    </div>
                    <Switch id="notify-storage" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Input id="email-notifications" type="email" placeholder="Enter email address" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
