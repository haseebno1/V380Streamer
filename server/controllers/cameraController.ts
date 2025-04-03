import { storage } from "../storage";
import { InsertCamera, Camera } from "@shared/schema";

class CameraController {
  async getAllCameras(): Promise<Camera[]> {
    return storage.getAllCameras();
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    return storage.getCamera(id);
  }

  async createCamera(camera: InsertCamera): Promise<Camera> {
    return storage.createCamera(camera);
  }

  async updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | undefined> {
    return storage.updateCamera(id, camera);
  }

  async deleteCamera(id: number): Promise<boolean> {
    return storage.deleteCamera(id);
  }

  async setCameraStatus(
    id: number, 
    isOnline: boolean, 
    isRecording: boolean
  ): Promise<Camera | undefined> {
    return storage.setCameraStatus(id, isOnline, isRecording);
  }
}

export const cameraController = new CameraController();
