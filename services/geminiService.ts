import { GoogleGenAI, Type, Part } from "@google/genai";
import type { TransitionPlan, UserProfile, Task, Milestone, Sprint, Certification, CompanyProspect } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const planSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief summary of the career transition plan."
        },
        careerTeamFeedback: {
            type: Type.OBJECT,
            description: "Detailed feedback from the AI advisory team.",
            properties: {
                overallImpression: {
                    type: Type.STRING,
                    description: "The AI team's overall impression of the user's profile and transition viability."
                },
                resumeFeedback: {
                    type: Type.STRING,
                    description: "Specific, actionable feedback on the user's resume and uploaded documents."
                },
                skillsGapAnalysis: {
                    type: Type.STRING,
                    description: "An analysis of the key skills the user is missing for their target role, inferred from their documents."
                }
            },
            required: ["overallImpression", "resumeFeedback", "skillsGapAnalysis"]
        },
        skillsToDevelop: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key skills the user needs to develop for the target role."
        },
        networkingSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable suggestions for networking within the target industry, considering target locations."
        },
        projectIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of potential project ideas to build a portfolio."
        },
        milestones: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: {
                        type: Type.STRING,
                        description: "The target date for the milestone in YYYY-MM-DD format."
                    },
                    title: {
                        type: Type.STRING,
                        description: "A short title for the milestone."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief description of what the milestone entails."
                    },
                    type: {
                        type: Type.STRING,
                        description: "The category of the milestone.",
                        enum: ['Skill Development', 'Networking', 'Application', 'Project Work', 'Personal Branding']
                    }
                },
                required: ["date", "title", "description", "type"]
            },
            description: "A timeline of milestones for the career transition."
        },
        sprints: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A thematic title for the sprint, e.g., 'Sprint 1: Foundational Skills'." },
                    dateRange: { type: Type.STRING, description: "The two-week date range for the sprint, e.g., 'YYYY-MM-DD to YYYY-MM-DD'." },
                    tasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING, description: "The description of the task." },
                                status: { type: Type.STRING, description: "The initial status of the task, which must be 'To Do'." },
                                inertiaAction: { type: Type.STRING, description: "A small, actionable first step (2-5 words) to help the user get started. Example: 'Open a new doc'." },
                                dueDate: { type: Type.STRING, description: "An optional, suggested due date for the task in YYYY-MM-DD format, falling within the sprint's date range." }
                            },
                            required: ["text", "status", "inertiaAction"]
                        }
                    }
                },
                required: ["title", "dateRange", "tasks"]
            },
            description: "A series of bi-weekly sprints containing actionable tasks."
        },
        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full name of the certification." },
                    status: { type: Type.STRING, description: "The initial status, which must be 'Recommended'." }
                },
                required: ["name", "status"]
            },
            description: "A list of recommended professional certifications."
        },
        companyProspects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    companyName: { type: Type.STRING, description: "The name of the potential employer." },
                    probability: {
                        type: Type.STRING,
                        description: "The estimated probability of getting hired at this company.",
                        enum: ['High', 'Medium', 'Low']
                    },
                    compensationRange: { type: Type.STRING, description: "The estimated total compensation range for the target role at this company (e.g., '$140,000 - $170,000')." },
                    targetLevel: { 
                        type: Type.STRING, 
                        description: "The recommended job level the user should target at this company (e.g., 'L4 / SDE II', 'Senior Product Manager', 'Associate')."
                    }
                },
                required: ["companyName", "probability", "compensationRange", "targetLevel"]
            },
            description: "A list of 3-5 potential companies, including hiring probability and compensation estimates."
        }
    },
    required: ["summary", "careerTeamFeedback", "skillsToDevelop", "networkingSuggestions", "projectIdeas", "milestones", "sprints", "certifications", "companyProspects"]
};


export const generateTransitionPlan = async (profile: UserProfile): Promise<TransitionPlan> => {
    const model = 'gemini-2.5-pro';
    
    const { targetRole, documents, targetLocations, additionalConsiderations } = profile;

    const textPrompt = `
        Act as an expert AI career advisory team. Based on the user's complete profile, create a comprehensive career transition plan.
        Analyze all provided materials: the content of uploaded documents (resumes, etc.) to infer their current role and experience. Also take into account any additional considerations the user has provided.

        User Details:
        - Target Role(s): ${targetRole}
        - Target Geographic Areas: ${targetLocations || "Not specified."}
        - Additional Considerations from User:
        ---
        ${additionalConsiderations || "None provided."}
        ---

        First, provide a detailed "AI Advisory Team Debrief" with the following sections:
        1.  **Overall Impression:** Give an overall impression of the candidate's profile, strengths, and the feasibility of this transition. Be encouraging but realistic.
        2.  **Resume Feedback:** Provide specific, actionable feedback on their resume and other professional documents. What's strong? What needs improvement to attract recruiters for the target role?
        3.  **Skills Gap Analysis:** Clearly identify the most critical skill gaps between their inferred current profile and the target role.

        Next, generate the rest of the actionable plan, keeping their target locations and additional considerations in mind:
        4.  **Summary:** A brief overview of the transition strategy.
        5.  **Skills to Develop:** Essential technical and soft skills to acquire.
        6.  **Networking Suggestions:** Specific advice, tailored to their target locations if provided.
        7.  **Project Ideas:** Concrete project ideas to build a relevant portfolio.
        8.  **Milestones:** A timeline with key milestones. Each milestone must have a date, title, description, and a 'type' from the allowed categories. Dates should be relative to today's date (${new Date().toISOString().split('T')[0]}) and spread over a realistic timeframe (e.g., 3-6 months).
        9.  **Sprints:** Group all actionable tasks into a series of themed, bi-weekly sprints. Each sprint needs a title, a two-week date range, and a list of tasks. For each task, provide an "inertiaAction" - a very small, easy first step to get started. All tasks must have an initial status of "To Do". Also, suggest an optional dueDate for each task that falls within the sprint's date range.
        10. **Certifications:** Identify and list key professional certifications relevant to the target role. Each certification should have an initial status of 'Recommended'.
        
        Finally, provide a "Target Company Analysis":
        11. **Company Prospects:** Based on the user's profile, target role(s), and location preferences, identify 3-5 realistic target companies. For each company, provide:
            - The company's name.
            - The probability of getting hired ('High', 'Medium', or 'Low'). This should be a realistic assessment based on the user's current qualifications and the company's hiring standards.
            - A realistic estimated total compensation range for the target role at that specific company. Base your compensation estimates on publicly available data from sources like levels.fyi if possible, factoring in the role and location.
            - The specific job level you recommend the user target (e.g., 'L4 / SDE II', 'Senior Product Manager', 'Associate'). This should be a realistic assessment.

        Provide the entire output in the specified JSON format.
    `;
    
    const contents: Part[] = [{ text: textPrompt }];
    
    if (documents && documents.length > 0) {
        documents.forEach(doc => {
            contents.push({
                inlineData: {
                    mimeType: doc.mimeType,
                    data: doc.data,
                }
            });
        });
    }


    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: contents },
            config: {
                responseMimeType: "application/json",
                responseSchema: planSchema,
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        
        const jsonText = response.text.trim();
        const plan: Omit<TransitionPlan, 'sprints' | 'milestones' | 'certifications'> & {
            sprints: Array<Omit<Sprint, 'tasks'> & { tasks: Omit<Task, 'id'>[] }>;
            milestones: Omit<Milestone, 'id'>[];
            certifications: Omit<Certification, 'id'>[];
        } = JSON.parse(jsonText);

        let taskIdCounter = 0;
        const sprintsWithIds = plan.sprints.map(sprint => ({
            ...sprint,
            tasks: sprint.tasks.map(task => ({
                ...task,
                id: taskIdCounter++,
            }))
        }));

        const milestonesWithIds = plan.milestones.map((milestone, index) => ({
            ...milestone,
            id: index,
        }));

        const certificationsWithIds = plan.certifications.map((cert, index) => ({
            ...cert,
            id: index,
        }));

        return { ...plan, sprints: sprintsWithIds, milestones: milestonesWithIds, certifications: certificationsWithIds };


    } catch (error) {
        console.error("Error generating transition plan:", error);
        throw new Error("Failed to generate transition plan. Please check your API key and try again.");
    }
};