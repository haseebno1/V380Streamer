import { 
  InsertCamera, Camera, 
  InsertRecording, Recording, 
  InsertAlert, Alert,
  cameras, recordings, alerts
} from "@shared/schema";

export interface IStorage {
  // Camera operations
  getAllCameras(): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  setCameraStatus(id: number, isOnline: boolean, isRecording: boolean): Promise<Camera | undefined>;
  setMotionDetection(id: number, enabled: boolean, sensitivity?: number): Promise<Camera | undefined>;
  
  // Recording operations
  getRecordings(cameraId?: number): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecording(id: number, data: Partial<Recording>): Promise<Recording | undefined>;
  deleteRecording(id: number): Promise<boolean>;
  
  // Alert operations
  getAlerts(cameraId?: number, read?: boolean): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, data: Partial<Alert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;
  markAllAlertsAsRead(cameraId?: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private cameras: Map<number, Camera>;
  private recordings: Map<number, Recording>;
  private alerts: Map<number, Alert>;
  private cameraIdCounter: number;
  private recordingIdCounter: number;
  private alertIdCounter: number;

  constructor() {
    this.cameras = new Map();
    this.recordings = new Map();
    this.alerts = new Map();
    this.cameraIdCounter = 1;
    this.recordingIdCounter = 1;
    this.alertIdCounter = 1;
    
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
    
    // Add sample motion detection to cameras
    this.setMotionDetection(1, true, 60);
    this.setMotionDetection(2, true, 40);
    
    // Add some sample alerts
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    // Initial sample alerts
    const initialAlerts = [
      {
        cameraId: 1,
        type: "motion",
        message: "Motion detected on Front Office camera",
        timestamp: oneHourAgo,
        read: false,
        metadata: { confidenceScore: 0.85 }
      },
      {
        cameraId: 2,
        type: "motion",
        message: "Motion detected on Hallway camera",
        timestamp: twoHoursAgo,
        read: true,
        metadata: { confidenceScore: 0.92 }
      },
      {
        cameraId: 4,
        type: "offline",
        message: "Back Entrance camera went offline",
        timestamp: fourHoursAgo,
        read: false,
        metadata: null
      },
      {
        cameraId: 3,
        type: "storage",
        message: "Storage for Parking Area recordings is running low (85% used)",
        timestamp: twoHoursAgo,
        read: false,
        metadata: { usedSpace: "85%" }
      }
    ];
    
    // Add initial sample alerts
    initialAlerts.forEach(alert => {
      this.createAlert(alert);
    });
    
    // Add sample recordings
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    const sampleRecordings = [
      {
        cameraId: 1,
        filename: "Front_Office_20240401_080000.mp4",
        startTime: oneDayAgo,
        filepath: "/recordings/camera_1/Front_Office_20240401_080000.mp4",
        triggerType: "motion"
      },
      {
        cameraId: 2,
        filename: "Hallway_20240401_090000.mp4",
        startTime: oneDayAgo,
        filepath: "/recordings/camera_2/Hallway_20240401_090000.mp4",
        triggerType: "manual"
      },
      {
        cameraId: 1,
        filename: "Front_Office_20240331_150000.mp4",
        startTime: twoDaysAgo,
        filepath: "/recordings/camera_1/Front_Office_20240331_150000.mp4",
        triggerType: "schedule"
      }
    ];
    
    // Initialize some sample alerts
    const alertSamples = [
      {
        cameraId: 1,
        type: "motion",
        message: "Motion detected on Front Office camera",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        metadata: { confidenceScore: 0.85 }
      },
      {
        cameraId: 2,
        type: "offline",
        message: "Camera Hallway went offline",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        metadata: null
      },
      {
        cameraId: 1,
        type: "storage",
        message: "Storage for Front Office recordings is running low (85% used)",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        read: false,
        metadata: { usedSpace: "85%" }
      },
      {
        cameraId: 3,
        type: "system",
        message: "Motion detection enabled for Parking Lot",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        metadata: { sensitivity: 70 }
      }
    ];
    
    // Add sample alerts
    alertSamples.forEach(async (alert) => {
      await this.createAlert(alert);
    });
    
    // Add sample recordings with end times and file sizes
    sampleRecordings.forEach(async (recording) => {
      const newRecording = await this.createRecording(recording);
      
      // Finalize the recording with end time and filesize
      const endTime = new Date(new Date(recording.startTime).getTime() + 15 * 60 * 1000); // 15 minutes later
      await this.updateRecording(newRecording.id, {
        endTime,
        filesize: Math.floor(Math.random() * 500) + 500, // Random size between 500MB-1GB
        hasMotion: recording.triggerType === "motion"
      });
    });
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
      name: camera.name,
      rtspUrl: camera.rtspUrl,
      username: camera.username || null,
      password: camera.password || null,
      streamQuality: camera.streamQuality || "medium",
      autoConnect: camera.autoConnect || false,
      autoRecord: camera.autoRecord || false,
      isOnline: false,
      isRecording: false,
      motionDetection: false,
      motionSensitivity: 50,
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
    
    // Create an alert if camera goes offline
    if (camera.isOnline && !isOnline) {
      await this.createAlert({
        cameraId: id,
        type: "offline",
        message: `Camera ${camera.name} went offline`,
        timestamp: now,
        read: false,
        metadata: null
      });
    }
    
    return updatedCamera;
  }
  
  async setMotionDetection(id: number, enabled: boolean, sensitivity?: number): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) return undefined;
    
    const updatedCamera: Camera = {
      ...camera,
      motionDetection: enabled,
      motionSensitivity: sensitivity !== undefined ? sensitivity : camera.motionSensitivity
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
      cameraId: recording.cameraId,
      filename: recording.filename,
      startTime: recording.startTime,
      filepath: recording.filepath,
      triggerType: recording.triggerType || "manual",
      endTime: null,
      filesize: 0,
      hasMotion: false
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
  
  // Alert methods
  async getAlerts(cameraId?: number, read?: boolean): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());
    
    if (cameraId !== undefined) {
      alerts = alerts.filter(alert => alert.cameraId === cameraId);
    }
    
    if (read !== undefined) {
      alerts = alerts.filter(alert => alert.read === read);
    }
    
    // Sort by timestamp descending (newest first)
    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const newAlert: Alert = {
      id,
      cameraId: alert.cameraId,
      type: alert.type,
      message: alert.message,
      timestamp: alert.timestamp || new Date(),
      read: false,
      metadata: alert.metadata || null
    };
    
    this.alerts.set(id, newAlert);
    return newAlert;
  }
  
  async updateAlert(id: number, data: Partial<Alert>): Promise<Alert | undefined> {
    const existingAlert = this.alerts.get(id);
    if (!existingAlert) return undefined;
    
    const updatedAlert = { ...existingAlert, ...data };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }
  
  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = {
      ...alert,
      read: true
    };
    
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async markAllAlertsAsRead(cameraId?: number): Promise<number> {
    let count = 0;
    for (const [id, alert] of this.alerts.entries()) {
      if (cameraId === undefined || alert.cameraId === cameraId) {
        if (!alert.read) {
          this.alerts.set(id, { ...alert, read: true });
          count++;
        }
      }
    }
    
    return count;
  }
}

export const storage = new MemStorage();
