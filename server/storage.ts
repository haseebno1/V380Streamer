import { InsertCamera, Camera, InsertRecording, Recording, cameras, recordings } from "@shared/schema";

export interface IStorage {
  // Camera operations
  getAllCameras(): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  setCameraStatus(id: number, isOnline: boolean, isRecording: boolean): Promise<Camera | undefined>;
  
  // Recording operations
  getRecordings(cameraId?: number): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecording(id: number, data: Partial<Recording>): Promise<Recording | undefined>;
  deleteRecording(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private cameras: Map<number, Camera>;
  private recordings: Map<number, Recording>;
  private cameraIdCounter: number;
  private recordingIdCounter: number;

  constructor() {
    this.cameras = new Map();
    this.recordings = new Map();
    this.cameraIdCounter = 1;
    this.recordingIdCounter = 1;
    
    // Add some sample cameras
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleCameras: InsertCamera[] = [
      {
        name: "Front Office",
        rtspUrl: "rtsp://192.168.1.100:554/stream1",
        username: "admin",
        password: "admin",
        streamQuality: "high",
        autoConnect: true,
        autoRecord: true
      },
      {
        name: "Hallway",
        rtspUrl: "rtsp://192.168.1.101:554/stream1",
        username: "admin",
        password: "admin",
        streamQuality: "low",
        autoConnect: true,
        autoRecord: true
      },
      {
        name: "Parking Area",
        rtspUrl: "rtsp://192.168.1.102:554/stream1",
        username: "admin",
        password: "admin",
        streamQuality: "medium",
        autoConnect: true,
        autoRecord: false
      },
      {
        name: "Back Entrance",
        rtspUrl: "rtsp://192.168.1.103:554/stream1",
        username: "admin",
        password: "admin",
        streamQuality: "medium",
        autoConnect: true,
        autoRecord: false
      }
    ];

    // Add sample cameras
    sampleCameras.forEach(camera => {
      this.createCamera(camera);
    });

    // Set camera statuses (3 online, 1 offline; 2 recording)
    this.setCameraStatus(1, true, true);
    this.setCameraStatus(2, true, true);
    this.setCameraStatus(3, true, false);
    this.setCameraStatus(4, false, false);
  }

  async getAllCameras(): Promise<Camera[]> {
    return Array.from(this.cameras.values());
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async createCamera(camera: InsertCamera): Promise<Camera> {
    const id = this.cameraIdCounter++;
    const now = new Date();
    const newCamera: Camera = {
      id,
      ...camera,
      isOnline: false,
      isRecording: false,
      lastConnected: now
    };
    this.cameras.set(id, newCamera);
    return newCamera;
  }

  async updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | undefined> {
    const existingCamera = this.cameras.get(id);
    if (!existingCamera) return undefined;

    const updatedCamera = { ...existingCamera, ...camera };
    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    return this.cameras.delete(id);
  }

  async setCameraStatus(id: number, isOnline: boolean, isRecording: boolean): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) return undefined;

    const now = new Date();
    const updatedCamera: Camera = {
      ...camera,
      isOnline,
      isRecording,
      lastConnected: isOnline ? now : camera.lastConnected
    };

    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async getRecordings(cameraId?: number): Promise<Recording[]> {
    const allRecordings = Array.from(this.recordings.values());
    if (cameraId) {
      return allRecordings.filter(recording => recording.cameraId === cameraId);
    }
    return allRecordings;
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    const id = this.recordingIdCounter++;
    const newRecording: Recording = {
      id,
      ...recording,
      endTime: null, // Initially null as recording is in progress
      filesize: 0 // Will be updated when recording ends
    };
    this.recordings.set(id, newRecording);
    return newRecording;
  }

  async updateRecording(id: number, data: Partial<Recording>): Promise<Recording | undefined> {
    const existingRecording = this.recordings.get(id);
    if (!existingRecording) return undefined;

    const updatedRecording = { ...existingRecording, ...data };
    this.recordings.set(id, updatedRecording);
    return updatedRecording;
  }

  async deleteRecording(id: number): Promise<boolean> {
    return this.recordings.delete(id);
  }
}

export const storage = new MemStorage();
