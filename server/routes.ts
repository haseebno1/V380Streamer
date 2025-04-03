import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cameraController } from "./controllers/cameraController";
import { recordingController } from "./controllers/recordingController";
import { alertController } from "./controllers/alertController";
import { insertCameraSchema, insertRecordingSchema, insertAlertSchema, getResolution } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: any) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  // Camera routes
  app.get("/api/cameras", async (req, res) => {
    try {
      const cameras = await cameraController.getAllCameras();
      res.json(cameras);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cameras" });
    }
  });

  app.get("/api/cameras/:id", async (req, res) => {
    try {
      const camera = await cameraController.getCamera(parseInt(req.params.id, 10));
      if (!camera) {
        return res.status(404).json({ error: "Camera not found" });
      }
      res.json(camera);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch camera" });
    }
  });

  app.post("/api/cameras", async (req, res) => {
    try {
      const validatedData = insertCameraSchema.parse(req.body);
      const camera = await cameraController.createCamera(validatedData);
      res.status(201).json(camera);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const camera = await cameraController.updateCamera(id, req.body);
      if (!camera) {
        return res.status(404).json({ error: "Camera not found" });
      }
      res.json(camera);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.delete("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await cameraController.deleteCamera(id);
      if (!success) {
        return res.status(404).json({ error: "Camera not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete camera" });
    }
  });

  app.put("/api/cameras/:id/status", async (req, res) => {
    try {
      const { isOnline, isRecording } = req.body;
      const id = parseInt(req.params.id, 10);
      
      const camera = await cameraController.setCameraStatus(id, isOnline, isRecording);
      if (!camera) {
        return res.status(404).json({ error: "Camera not found" });
      }
      res.json(camera);
    } catch (error) {
      res.status(500).json({ error: "Failed to update camera status" });
    }
  });
  
  app.put("/api/cameras/:id/motion-detection", async (req, res) => {
    try {
      const { enabled, sensitivity } = req.body;
      const id = parseInt(req.params.id, 10);
      
      // Get the camera first to access its name
      const existingCamera = await cameraController.getCamera(id);
      if (!existingCamera) {
        return res.status(404).json({ error: "Camera not found" });
      }
      
      const camera = await storage.setMotionDetection(id, enabled, sensitivity);
      
      // Create an alert when motion detection is enabled or settings change
      if (enabled && (!existingCamera.motionDetection || 
          (existingCamera.motionSensitivity !== sensitivity && sensitivity !== undefined))) {
        await alertController.createAlert({
          cameraId: id,
          type: "system",
          message: `Motion detection ${existingCamera.motionDetection ? 'settings updated' : 'enabled'} for ${existingCamera.name}`,
          timestamp: new Date(),
          read: false,
          metadata: { sensitivity: sensitivity || existingCamera.motionSensitivity }
        });
      }
      
      res.json(camera);
    } catch (error) {
      res.status(500).json({ error: "Failed to update motion detection settings" });
    }
  });

  // Recording routes
  app.get("/api/recordings", async (req, res) => {
    try {
      const cameraId = req.query.cameraId ? parseInt(req.query.cameraId as string, 10) : undefined;
      const recordings = await recordingController.getRecordings(cameraId);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recordings" });
    }
  });

  app.get("/api/recordings/:id", async (req, res) => {
    try {
      const recording = await recordingController.getRecording(parseInt(req.params.id, 10));
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recording" });
    }
  });

  app.post("/api/recordings", async (req, res) => {
    try {
      const validatedData = insertRecordingSchema.parse(req.body);
      const recording = await recordingController.createRecording(validatedData);
      res.status(201).json(recording);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const recording = await recordingController.updateRecording(id, req.body);
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: "Failed to update recording" });
    }
  });

  app.delete("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await recordingController.deleteRecording(id);
      if (!success) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recording" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const cameraId = req.query.cameraId ? parseInt(req.query.cameraId as string, 10) : undefined;
      const read = req.query.read !== undefined ? req.query.read === 'true' : undefined;
      const alerts = await alertController.getAlerts(cameraId, read);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await alertController.getAlert(parseInt(req.params.id, 10));
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await alertController.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Create specific types of alerts
  app.post("/api/alerts/motion", async (req, res) => {
    try {
      const { cameraId, cameraName, confidenceScore } = req.body;
      if (!cameraId || !cameraName) {
        return res.status(400).json({ error: "Camera ID and name are required" });
      }
      
      const alert = await alertController.createMotionAlert(
        parseInt(cameraId, 10), 
        cameraName, 
        confidenceScore
      );
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create motion alert" });
    }
  });

  app.put("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const alert = await alertController.markAlertAsRead(id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  app.put("/api/alerts/mark-all-read", async (req, res) => {
    try {
      const cameraId = req.query.cameraId ? parseInt(req.query.cameraId as string, 10) : undefined;
      const count = await alertController.markAllAlertsAsRead(cameraId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alerts as read" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await alertController.deleteAlert(id);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });
  
  // Stream related endpoints
  app.post("/api/stream/connect", async (req, res) => {
    try {
      const { url, username, password, quality } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "RTSP URL is required" });
      }
      
      // In a real implementation, this would connect to the actual RTSP stream
      // For demo purposes, we're simulating a successful connection
      const resolution = getResolution(quality || "medium");
      
      // Simulate a brief delay for connection
      await new Promise(resolve => setTimeout(resolve, 500));
      
      res.json({ 
        connected: true,
        streamId: Math.floor(Math.random() * 10000),
        resolution
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to stream" });
    }
  });
  
  app.get("/api/stream", async (req, res) => {
    try {
      const { url, username, password, quality } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: "RTSP URL is required" });
      }
      
      // In a real implementation, this would fetch frames from the RTSP stream
      // and convert them to HLS or another web-compatible format
      // For demo purposes, we're returning a simulated response
      
      // Simulate a brief delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // In a real implementation, we would stream video data here
      // For demo purposes, we're returning a placeholder
      res.json({ 
        stream: true,
        message: "Stream data would be sent here in a real implementation"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to stream video" });
    }
  });
  
  app.get("/api/recordings/:id/play", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const recording = await recordingController.getRecording(id);
      
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      
      // In a real implementation, this would stream the recording file
      // For demo purposes, we're returning the recording data
      res.json({ 
        recording,
        message: "Recording playback would be implemented here in production"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to play recording" });
    }
  });
  
  app.get("/api/recordings/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const recording = await recordingController.getRecording(id);
      
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      
      // In a real implementation, this would send the recording file
      // For demo purposes, we're simulating a download
      res.json({ 
        download: true,
        recording,
        message: "Recording download would be implemented here in production"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to download recording" });
    }
  });
  
  return httpServer;
}
