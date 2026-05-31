export type UserTier = 'free' | 'premium';

export interface Biomarker {
  name: string;
  value: string;
  unit: string;
  /** API returns normalRangeText (snake_case → camelCase); legacy alias normalRange */
  normalRange: string;
  normalRangeText?: string;
  status: 'Normal' | 'Low' | 'High' | 'Deficient' | 'Elevated' | 'Critical';
  explanation: string;
  explanationHindi: string;
  advice: string;
  indianFoods: string[];
  category: 'Blood' | 'Thyroid' | 'Vitamin' | 'Liver' | 'Kidney' | 'Sugar' | 'Lipid' | 'Other';
}

export interface LabReport {
  patientName: string;
  patientAge: string;
  patientGender: string;
  reportDate: string;
  labName: string;
  healthScore: number;
  healthGrade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  biologicalAge: number;
  chronologicalAge: number;
  bioAgeInsight: string;
  bioAgeProtocol: string[];
  summary: string;
  summaryHindi: string;
  doctorNote: string;
  topPriority: string;
  hasCriticalAlert: boolean;
  criticalAlertText: string;
  biomarkers: Biomarker[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  plan: 'per_report' | 'monthly';
}
