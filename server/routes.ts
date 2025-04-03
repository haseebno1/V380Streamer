import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cameraController } from "./controllers/cameraController";
import { recordingController } from "./controllers/recordingController";
import { insertCameraSchema, insertRecordingSchema } from "@shared/schema";
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

  // Stream related endpoints can be added here
  
  return httpServer;
}
