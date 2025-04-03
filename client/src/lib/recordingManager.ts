import { apiRequest } from "./queryClient";
import { InsertRecording, Recording } from "@shared/schema";

// Class to manage recording sessions
export class RecordingManager {
  private activeRecordings: Map<number, Recording>;

  constructor() {
    this.activeRecordings = new Map();
  }

  // Start a new recording for a camera
  public async startRecording(cameraId: number, cameraName: string): Promise<Recording | null> {
    try {
      // Check if recording is already in progress for this camera
      if (this.activeRecordings.has(cameraId)) {
        return this.activeRecordings.get(cameraId) || null;
      }
      
      // Generate a unique filename based on camera ID and timestamp
      const timestamp = new Date();
      const fileName = `${cameraName.replace(/\s+/g, "_")}_${timestamp.toISOString().replace(/[:.]/g, "-")}.mp4`;
      
      // Create a new recording entry in the database
      const recordingData: InsertRecording = {
        cameraId,
        filename: fileName,
        startTime: timestamp,
        filepath: `/recordings/camera_${cameraId}/${fileName}`
      };
      
      const response = await apiRequest("POST", "/api/recordings", recordingData);
      const recording: Recording = await response.json();
      
      // Store the active recording
      this.activeRecordings.set(cameraId, recording);
      
      return recording;
    } catch (error) {
      console.error("Failed to start recording:", error);
      return null;
    }
  }

  // Stop an active recording
  public async stopRecording(cameraId: number): Promise<boolean> {
    try {
      const recording = this.activeRecordings.get(cameraId);
      
      if (!recording) {
        return false;
      }
      
      // Update the recording with end time
      const endTime = new Date();
      
      // Calculate approximate file size (1MB per minute as a placeholder)
      const duration = endTime.getTime() - new Date(recording.startTime).getTime();
      const filesize = Math.round(duration / 60000 * 1024 * 1024);
      
      await apiRequest("PUT", `/api/recordings/${recording.id}`, {
        endTime,
        filesize
      });
      
      // Remove from active recordings
      this.activeRecordings.delete(cameraId);
      
      return true;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      return false;
    }
  }

  // Check if a camera is currently recording
  public isRecording(cameraId: number): boolean {
    return this.activeRecordings.has(cameraId);
  }

  // Get all active recordings
  public getActiveRecordings(): Recording[] {
    return Array.from(this.activeRecordings.values());
  }
}

// Create a singleton instance
export const recordingManager = new RecordingManager();
