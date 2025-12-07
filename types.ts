export interface SecurityDevice {
  name: string;
  category: string; // e.g., "Camera", "Sensor", "Lock"
  description: string;
  reasoning: string;
  estimatedCost: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SecurityPlan {
  vulnerabilities: string[];
  recommendations: SecurityDevice[];
  totalEstimatedCostMin: number;
  totalEstimatedCostMax: number;
  executiveSummary: string;
  ecosystemBenefits: string[];
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}