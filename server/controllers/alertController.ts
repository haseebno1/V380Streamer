import { storage } from "../storage";
import { InsertAlert, Alert } from "@shared/schema";

class AlertController {
  async getAlerts(cameraId?: number, read?: boolean): Promise<Alert[]> {
    return storage.getAlerts(cameraId, read);
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return storage.getAlert(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    return storage.createAlert(alert);
  }

  async updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined> {
    return storage.updateAlert(id, alert);
  }

  async deleteAlert(id: number): Promise<boolean> {
    return storage.deleteAlert(id);
  }
  
  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    return storage.markAlertAsRead(id);
  }
  
  async markAllAlertsAsRead(cameraId?: number): Promise<number> {
    return storage.markAllAlertsAsRead(cameraId);
  }
  
  // Helper method to generate motion detection alert
  async createMotionAlert(cameraId: number, cameraName: string, confidenceScore: number = 0.75): Promise<Alert> {
    const alert: InsertAlert = {
      cameraId,
      type: "motion",
      message: `Motion detected on ${cameraName} camera`,
      timestamp: new Date(),
      read: false,
      metadata: { confidenceScore }
    };
    
    return this.createAlert(alert);
  }
  
  // Helper method to generate offline camera alert
  async createOfflineAlert(cameraId: number, cameraName: string): Promise<Alert> {
    const alert: InsertAlert = {
      cameraId,
      type: "offline",
      message: `Camera ${cameraName} went offline`,
      timestamp: new Date(),
      read: false,
      metadata: null
    };
    
    return this.createAlert(alert);
  }
  
  // Helper method to generate storage alert
  async createStorageAlert(cameraId: number, cameraName: string, usedSpace: string): Promise<Alert> {
    const alert: InsertAlert = {
      cameraId,
      type: "storage",
      message: `Storage for ${cameraName} recordings is running low (${usedSpace} used)`,
      timestamp: new Date(),
      read: false,
      metadata: { usedSpace }
    };
    
    return this.createAlert(alert);
  }
}

export const alertController = new AlertController();