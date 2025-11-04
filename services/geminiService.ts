import { GoogleGenAI, Type, Part } from "@google/genai";
import type { TransitionPlan, UserProfile, Task, Milestone, Sprint, Certification, CompanyProspect, GroundingChunk } from '../types';

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
                    status: { type: Type.STRING, description: "The initial status, which must be 'Recommended'." },
                    courseProvider: { type: Type.STRING, description: "The name of the organization or platform offering the recommended course (e.g., 'Coursera', 'Udemy')." },
                    courseUrl: { type: Type.STRING, description: "A direct URL to the specific, recommended course." },
                    reasoning: { type: Type.STRING, description: "A brief justification for why this specific course was chosen (e.g., 'Highly-rated by students, covers all exam objectives.')." }
                },
                required: ["name", "status", "courseProvider", "courseUrl", "reasoning"]
            },
            description: "A list of recommended professional certifications with specific course suggestions found via search."
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


export const generateTransitionPlan = async (profile: UserProfile): Promise<{ plan: TransitionPlan; sources: GroundingChunk[] }> => {
    const model = 'gemini-2.5-pro';
    
    const { documents, ...userDetails } = profile;

    const textPrompt = `
        Act as an expert AI career advisory team for a military service member transitioning to the civilian workforce. Based on the user's complete profile, create a comprehensive, actionable career transition plan.
        Analyze all provided materials: the content of uploaded documents (resumes, evaluations, etc.) to infer their current role, skills, and experience. Also take into account all other details the user has provided.

        User Details:
        - Target Role(s): ${userDetails.targetRole}
        - Target Geographic Areas: ${userDetails.targetLocations || "Not specified."}
        - Retirement Date: ${userDetails.retirementDate || "Not specified."}
        - Terminal Leave Days: ${userDetails.leaveDays || 0}
        - Permissive TDY (PTDY) Days: ${userDetails.ptdyDays || 0}
        - Career Skills Program (CSP) Days: ${userDetails.cspDays || 0}
        - Additional Considerations from User:
        ---
        ${userDetails.additionalConsiderations || "None provided."}
        ---

        CORE TASK: TIMELINE GENERATION
        If a retirement date is provided, you MUST create a detailed, reverse-engineered timeline.
        1.  Calculate the final day of work by subtracting leave, PTDY, and CSP days from the retirement date. This is the start of the "final out" period.
        2.  All actionable tasks, sprints, and milestones MUST be scheduled to complete BEFORE this "final out" period begins.
        3.  The timeline should be broken down into bi-weekly sprints. Dates should be relative to today's date (${new Date().toISOString().split('T')[0]}). The entire plan should be realistic for the available timeframe. If no date is provided, create a generic 6-month plan.

        PLAN STRUCTURE:

        First, provide a detailed "AI Advisory Team Debrief":
        1.  **Overall Impression:** Give an overall impression of the candidate's profile, strengths, and the feasibility of this transition. Be encouraging but realistic.
        2.  **Resume Feedback:** Provide specific, actionable feedback on their resume and other professional documents. What's strong? What needs improvement to attract recruiters for the target role?
        3.  **Skills Gap Analysis:** Clearly identify the most critical skill gaps between their inferred current profile and the target role.

        Next, generate the rest of the actionable plan based on the timeline you've calculated:
        4.  **Summary:** A brief overview of the transition strategy.
        5.  **Skills to Develop:** Essential technical and soft skills to acquire.
        6.  **Networking Suggestions:** Specific advice, tailored to their target locations if provided.
        7.  **Project Ideas:** Concrete project ideas to build a relevant portfolio.
        8.  **Milestones:** A timeline with key milestones. Each milestone must have a date, title, description, and a 'type'.
        9.  **Sprints:** Group all actionable tasks into themed, bi-weekly sprints with specific date ranges. For each task, provide an "inertiaAction" (a very small, easy first step) and set status to "To Do".
        
        Next, generate "Certifications & Training":
        10. **Certifications:** Identify key professional certifications. For each certification, you MUST use your search tool to find a specific, highly-reviewed online course. Provide the certification name, the course provider (e.g., Coursera, Udemy), a direct URL to the course, and brief reasoning for why you chose it.
        
        Finally, provide a "Target Company Analysis":
        11. **Company Prospects:** Based on public data and the user's profile, identify 3-5 realistic target companies. For each, provide the name, hiring probability, a realistic compensation range (use sources like levels.fyi as a reference), and the specific job level to target.

        CRITICAL REQUIREMENT: You MUST provide the entire output as a single, valid JSON object that conforms to the structure described above. Do not include any text, formatting, or markdown outside of the JSON object.
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
            tools: [{googleSearch: {}}],
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

        // Clean the response text to ensure it's valid JSON
        let jsonText = response.text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7);
        }
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.substring(0, jsonText.length - 3);
        }
        
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
        
        const finalPlan = { ...plan, sprints: sprintsWithIds, milestones: milestonesWithIds, certifications: certificationsWithIds };

        return { plan: finalPlan, sources };

    } catch (error) {
        console.error("Error generating transition plan:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to generate a valid plan from the AI. The response was not in the expected format. Please try again.");
        }
        throw new Error("Failed to generate transition plan. The AI model may be overloaded or an error occurred.");
    }
};
