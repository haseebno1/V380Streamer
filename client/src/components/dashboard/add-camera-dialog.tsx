import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCameraSchema, InsertCamera, streamQualityOptions } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera } from "lucide-react";

// Extended schema with validation
const formSchema = insertCameraSchema.extend({
  name: z.string().min(2, { message: "Camera name must be at least 2 characters." }),
  rtspUrl: z.string()
    .min(7, { message: "RTSP URL is required" })
    .refine(val => val.startsWith("rtsp://"), {
      message: "URL must start with rtsp://"
    })
    // We don't enforce more strict validation as different camera models have different URL formats
    // For V380 Pro, the format is typically: rtsp://username:password@IP_address/live/ch00_1
});

interface AddCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCameraDialog({ open, onOpenChange }: AddCameraDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rtspUrl: "rtsp://user:password@IP_ADDRESS/live/ch00_1",
      username: "user",
      password: "password",
      streamQuality: "medium",
      autoConnect: true,
      autoRecord: false
    }
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      await apiRequest("/api/cameras", { method: "POST" }, data);
      
      queryClient.invalidateQueries({ queryKey: ['/api/cameras'] });
      
      toast({
        title: "Camera Added",
        description: `Successfully added ${data.name} camera.`
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add camera. Please check your connection details.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold mt-2">
            Add New Camera
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter the connection details for your V380 Pro camera.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Living Room Camera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rtspUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RTSP URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="rtsp://user:pass@192.168.1.xxx/live/ch00_1" 
                      className="font-mono text-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Standard format for V380 Pro: rtsp://username:password@IP_address/live/ch00_1
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="streamQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream Quality</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {streamQualityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoConnect"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Auto-connect on startup</FormLabel>
                    <FormDescription>
                      Automatically connect to this camera when the application starts.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoRecord"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Auto-record on connection</FormLabel>
                    <FormDescription>
                      Start recording automatically when connection is established.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Camera"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
