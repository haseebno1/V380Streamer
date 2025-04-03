import { streamQualityOptions, getResolution } from "@shared/schema";

// This class handles connecting to RTSP streams via the backend server
// In a real implementation, this would use WebSockets or another mechanism to receive video frames
export class RtspClient {
  private streamUrl: string;
  private username: string;
  private password: string;
  private quality: string;
  private isConnected: boolean = false;
  private isRecording: boolean = false;
  private onStatusChange: (status: { isConnected: boolean; isRecording: boolean }) => void;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;

  constructor(
    streamUrl: string,
    username: string,
    password: string,
    quality: string = "medium",
    onStatusChange: (status: { isConnected: boolean; isRecording: boolean }) => void
  ) {
    this.streamUrl = streamUrl;
    this.username = username;
    this.password = password;
    this.quality = quality;
    this.onStatusChange = onStatusChange;
  }

  // Connect to the RTSP stream
  public async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    try {
      this.connectionAttempts++;
      
      // Prepare connection options
      const resolution = getResolution(this.quality);
      
      // In a real implementation, we would make an actual API call to start the stream
      // For demo purposes, we're simulating a successful connection
      const response = await fetch(`/api/stream/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: this.streamUrl,
          username: this.username,
          password: this.password,
          quality: this.quality,
          resolution
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to stream: ${response.statusText}`);
      }

      // Connection successful
      this.isConnected = true;
      this.connectionAttempts = 0;
      this.onStatusChange({ isConnected: true, isRecording: this.isRecording });
      return true;
    } catch (error) {
      console.error("RTSP connection error:", error);
      
      // If we've reached max connection attempts, stop trying
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.isConnected = false;
        this.onStatusChange({ isConnected: false, isRecording: false });
        return false;
      }
      
      // Otherwise, try again after a delay
      return new Promise((resolve) => {
        setTimeout(async () => {
          resolve(await this.connect());
        }, 2000);
      });
    }
  }

  // Disconnect from the RTSP stream
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      // In a real implementation, we would make an actual API call to stop the stream
      // For demo purposes, we're simulating a successful disconnection
      await fetch(`/api/stream/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: this.streamUrl,
        }),
      });
    } catch (error) {
      console.error("RTSP disconnection error:", error);
    } finally {
      this.isConnected = false;
      this.isRecording = false;
      this.onStatusChange({ isConnected: false, isRecording: false });
    }
  }

  // Start recording
  public async startRecording(): Promise<boolean> {
    if (!this.isConnected || this.isRecording) {
      return false;
    }

    try {
      // In a real implementation, we would make an actual API call to start recording
      // For demo purposes, we're simulating a successful recording start
      const response = await fetch(`/api/stream/record/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: this.streamUrl,
          quality: this.quality,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start recording: ${response.statusText}`);
      }

      this.isRecording = true;
      this.onStatusChange({ isConnected: this.isConnected, isRecording: true });
      return true;
    } catch (error) {
      console.error("Start recording error:", error);
      return false;
    }
  }

  // Stop recording
  public async stopRecording(): Promise<boolean> {
    if (!this.isConnected || !this.isRecording) {
      return false;
    }

    try {
      // In a real implementation, we would make an actual API call to stop recording
      // For demo purposes, we're simulating a successful recording stop
      const response = await fetch(`/api/stream/record/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: this.streamUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to stop recording: ${response.statusText}`);
      }

      this.isRecording = false;
      this.onStatusChange({ isConnected: this.isConnected, isRecording: false });
      return true;
    } catch (error) {
      console.error("Stop recording error:", error);
      return false;
    }
  }

  // Change the stream quality
  public async setQuality(quality: string): Promise<boolean> {
    if (!this.isConnected) {
      this.quality = quality;
      return true;
    }

    try {
      // In a real implementation, we would make an actual API call to change quality
      // For demo purposes, we're simulating a successful quality change
      const resolution = getResolution(quality);
      
      const response = await fetch(`/api/stream/quality`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: this.streamUrl,
          quality,
          resolution,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to change quality: ${response.statusText}`);
      }

      this.quality = quality;
      return true;
    } catch (error) {
      console.error("Change quality error:", error);
      return false;
    }
  }

  // Get the current status
  public getStatus(): { isConnected: boolean; isRecording: boolean } {
    return {
      isConnected: this.isConnected,
      isRecording: this.isRecording,
    };
  }

  // Get the current quality
  public getQuality(): string {
    return this.quality;
  }
}

// Factory function to create RTSP clients
export function createRtspClient(
  streamUrl: string,
  username: string,
  password: string,
  quality: string = "medium",
  onStatusChange: (status: { isConnected: boolean; isRecording: boolean }) => void
): RtspClient {
  return new RtspClient(streamUrl, username, password, quality, onStatusChange);
}
