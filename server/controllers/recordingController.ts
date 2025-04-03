import { storage } from "../storage";
import { InsertRecording, Recording } from "@shared/schema";
import fs from "fs";
import path from "path";

class RecordingController {
  private recordingDirectory: string;

  constructor() {
    // Create recordings directory if it doesn't exist
    this.recordingDirectory = path.join(process.cwd(), "recordings");
    
    if (!fs.existsSync(this.recordingDirectory)) {
      fs.mkdirSync(this.recordingDirectory, { recursive: true });
    }
  }

  async getRecordings(cameraId?: number): Promise<Recording[]> {
    return storage.getRecordings(cameraId);
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    return storage.getRecording(id);
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    // Generate a unique filepath based on camera ID and timestamp
    const cameraDir = path.join(this.recordingDirectory, `camera_${recording.cameraId}`);
    
    if (!fs.existsSync(cameraDir)) {
      fs.mkdirSync(cameraDir, { recursive: true });
    }
    
    // Ensure filepath property is set
    const newRecording: InsertRecording = {
      ...recording,
      filepath: path.join(cameraDir, recording.filename)
    };
    
    return storage.createRecording(newRecording);
  }

  async updateRecording(id: number, data: Partial<Recording>): Promise<Recording | undefined> {
    return storage.updateRecording(id, data);
  }

  async deleteRecording(id: number): Promise<boolean> {
    const recording = await storage.getRecording(id);
    
    if (!recording) {
      return false;
    }
    
    // Delete the file if it exists
    if (fs.existsSync(recording.filepath)) {
      fs.unlinkSync(recording.filepath);
    }
    
    return storage.deleteRecording(id);
  }
}

export const recordingController = new RecordingController();
