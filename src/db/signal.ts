// src/db/signal.ts

export interface Signal {
  id: string;
  title: string;
  description: string;
  engagementId: string;
  createdBy: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  urgency: 'low' | 'medium' | 'high';
  requiredSkills: string[];
  createdAt: string;
  updatedAt: string;
}
