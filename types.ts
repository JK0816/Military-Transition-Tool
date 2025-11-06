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
  retirementDate?: string;
  currentLeaveBalance?: number;
  ptdyDays?: number;
  cspDays?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Task {
    id: number;
    text: string;
    status: 'To Do' | 'In Progress' | 'Completed';
    inertiaAction?: string; // A small, easy first step to overcome inertia
    dueDate?: string; // YYYY-MM-DD
}

export interface Phase {
    id: string;
    title: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    objective: string;
    tasks: Task[];
    recommendedCourseIds: number[];
}

export interface RecommendedCourse {
    id: number;
    courseName: string;
    provider: string;
    url: string;
    reasoning: string;
}

export interface Certification {
    id: number;
    name: string;
    status: 'Recommended' | 'In Progress' | 'Completed';
    courseProvider?: string;
    courseUrl?: string;
    reasoning?: string;
}

export interface SkillAssessment {
    skillName: string;
    currentLevel: number; // Scale of 1-10
    requiredLevel: number; // Scale of 1-10
}

export interface AiGeneratedResumeExperience {
  title: string;
  company: string;
  location: string;
  dates: string;
  description: string;
}

export interface CareerTeamFeedback {
    overallImpression: string;
    resumeFeedback: string;
    skillsGapAnalysis: string;
    skillAssessments: SkillAssessment[];
    leaveCalculationBreakdown?: string;
    calculatedTerminalLeaveDays?: number;
    suggestedResumeExperience?: AiGeneratedResumeExperience[];
}

export interface CompanyProspect {
    id: string;
    companyName: string;
    probability: 'High' | 'Medium' | 'Low';
    compensationRange: string;
    targetLevel: string;
    reasoning: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface TransitionPlan {
    summary: string;
    careerTeamFeedback: CareerTeamFeedback;
    skillsToDevelop: string[];
    networkingSuggestions: string[];
    projectIdeas: string[];
    phases: Phase[];
    certifications: Certification[];
    recommendedCourses: RecommendedCourse[];
    companyProspects: CompanyProspect[];
    groundingSources?: GroundingChunk[];
}