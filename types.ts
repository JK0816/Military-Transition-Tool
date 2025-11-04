export interface DocumentFile {
  fileName: string;
  mimeType: string;
  data: string; // base64 encoded
  uploadDate: string; // ISO string
}

export interface UserProfile {
  targetRole: string;
  targetLocations?: string;
  additionalConsiderations?: string;
  documents: DocumentFile[];
}

export interface Task {
    id: number;
    text: string;
    status: 'To Do' | 'In Progress' | 'Completed';
    inertiaAction?: string; // A small, easy first step to overcome inertia
    dueDate?: string; // YYYY-MM-DD
}

export interface Sprint {
    title: string;
    dateRange: string;
    tasks: Task[];
}

export interface Milestone {
    id: number;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
    type: 'Skill Development' | 'Networking' | 'Application' | 'Project Work' | 'Personal Branding';
}

export interface Certification {
    id: number;
    name: string;
    status: 'Recommended' | 'In Progress' | 'Completed';
}

export interface CareerTeamFeedback {
    overallImpression: string;
    resumeFeedback: string;
    skillsGapAnalysis: string;
}

export interface CompanyProspect {
    companyName: string;
    probability: 'High' | 'Medium' | 'Low';
    compensationRange: string;
    targetLevel: string;
}

export interface TransitionPlan {
    summary: string;
    careerTeamFeedback: CareerTeamFeedback;
    skillsToDevelop: string[];
    networkingSuggestions: string[];
    projectIdeas: string[];
    milestones: Milestone[];
    sprints: Sprint[];
    certifications: Certification[];
    companyProspects: CompanyProspect[];
}