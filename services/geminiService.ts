import { GoogleGenAI, Type, Part } from "@google/genai";
import type { TransitionPlan, UserProfile, Task, Milestone, Sprint, Certification, CompanyProspect, GroundingChunk, CareerTeamFeedback } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTransitionPlan = async (profile: UserProfile): Promise<{ plan: TransitionPlan; sources: GroundingChunk[] }> => {
    const model = 'gemini-2.5-flash';
    
    const { documents, ...userDetails } = profile;

    const textPrompt = `
        Act as an expert AI career advisory team for a military service member transitioning to the civilian workforce. Your team is a virtual hiring board composed of: a seasoned Technical Recruiter, a Hiring Manager in the user's target industry, a Head of HR from a major corporation, a Certified Career Counselor, an expert Resume Writer, a LinkedIn Profile Strategist, and a U.S. Army Human Resources Specialist (S-1 NCO) expert in AR 600-8-10. Your primary task is to provide feedback from these diverse perspectives and create a comprehensive, actionable, and REGULATION-COMPLIANT career transition plan.
        
        Your core directive is to provide recommendations that are **accurate, highly-detailed, and feasible**. All information, especially regarding compensation ranges, required skills, and training resources, MUST be up-to-date, reflecting the current job market. Use your search capabilities extensively to ground your advice in reality. Your goal is to create a plan that is not just aspirational, but practical and achievable for this service member.

        Analyze all provided materials: the content of uploaded documents (resumes, evaluations, etc.) to infer their current role, skills, and experience. Also take into account all other details the user has provided.

        User Details:
        - Target Role(s): ${userDetails.targetRole}
        - Target Geographic Areas: ${userDetails.targetLocations || "Not specified."}
        - Retirement Date: ${userDetails.retirementDate || "Not specified."}
        - Current Leave Balance (as of today): ${userDetails.currentLeaveBalance || 0}
        - Desired Terminal Leave Days: ${userDetails.desiredTerminalLeaveDays || 0}
        - Permissive TDY (PTDY) Days: ${userDetails.ptdyDays || 0}
        - Career Skills Program (CSP) Days: ${userDetails.cspDays || 0}
        - Additional Considerations from User:
        ---
        ${userDetails.additionalConsiderations || "None provided."}
        ---

        CORE TASK: TIMELINE & LEAVE CALCULATION (Follow AR 600-8-10 Principles)
        If a retirement date is provided, you MUST create a detailed, reverse-engineered timeline based on an accurate leave calculation.
        
        1.  **Calculate Final Leave Balance:**
            a.  Start with the user's 'Current Leave Balance' as of today (${new Date().toISOString().split('T')[0]}).
            b.  Calculate the number of full months from today until the retirement date. For each full month, add 2.5 days of earned leave.
            c.  Identify any fiscal year changes (October 1st) between today and the retirement date. For each Oct 1st, if the projected leave balance is over 60, cap it at 60. This is the 'Use or Lose' rule. Note this adjustment if made.
            d.  The result is the 'Final Calculated Leave Balance' available at retirement.
        
        2.  **Determine Terminal Leave Days for Plan:**
            a.  The number of terminal leave days to use in the plan is the LESSER of the user's 'Desired Terminal Leave Days' and the 'Final Calculated Leave Balance'.

        3.  **Create the Timeline:**
            a.  Calculate the final day of work by subtracting the determined Terminal Leave days, PTDY days, and CSP days from the retirement date. This is the start of the "final out" period.
            b.  All actionable tasks, sprints, and milestones MUST be scheduled to complete BEFORE this "final out" period begins.
            c.  The timeline should be broken down into bi-weekly sprints starting from today. If no retirement date is provided, create a generic 6-month plan.

        PLAN STRUCTURE:

        First, provide a detailed "AI Advisory Team Debrief":
        1.  **Leave Calculation Breakdown:** Show your work from the leave calculation above. Present it as a clear, step-by-step, multi-line string. Example: "Current Balance: 60 days\\nMonths to Retirement: 5 months\\nEarned Leave (5 x 2.5): +12.5 days\\n...\\nFinal Calculated Balance: 72.5 days". This is mandatory.
        2.  **Overall Impression:** Give an overall impression of the candidate's profile, strengths, and the feasibility of this transition.
        3.  **Resume Feedback:** Provide specific, actionable feedback on their resume and other professional documents.
        4.  **Skills Gap Analysis:** Clearly identify the most critical skill gaps between their inferred current profile and the target role.
        5.  **Skill Assessments:** For the top 5-7 most important skills identified in the gap analysis, provide a quantitative assessment. For each skill, rate their 'currentLevel' and the 'requiredLevel' for the target role on a scale of 1 to 10. This data is for a chart.

        Next, generate the rest of the actionable plan based on the timeline you've calculated:
        6.  **Summary:** A brief overview of the transition strategy.
        7.  **Skills to Develop:** Essential technical and soft skills to acquire.
        8.  **Networking Suggestions:** Specific advice, tailored to their target locations if provided.
        9.  **Project Ideas:** Concrete project ideas to build a relevant portfolio.
        10. **Milestones:** A timeline with key milestones.
        11. **Sprints:** Group all actionable tasks into themed, bi-weekly sprints.
        
        Next, generate "Certifications & Training":
        12. **Certifications:** Identify key professional certifications. For each, you MUST use your search tool to find a specific, highly-reviewed online course. Provide the certification name, the course provider, a direct URL to the course, and brief reasoning for why you chose it.
        
        Finally, provide a "Target Company Analysis":
        13. **Company Prospects:** Based on public data and the user's profile, identify 3-5 realistic target companies. For each, provide the name, hiring probability, a realistic and up-to-date compensation range, and the specific job level to target.

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
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 24576 },
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
        
        const parsedPlan: Partial<TransitionPlan & CareerTeamFeedback & {
            sprints?: Array<Omit<Sprint, 'tasks'> & { tasks?: Omit<Task, 'id'>[] }>;
            milestones?: Omit<Milestone, 'id'>[];
            certifications?: Omit<Certification, 'id'>[];
        }> = JSON.parse(jsonText);

        let taskIdCounter = 0;
        const sprintsWithIds = (parsedPlan.sprints ?? []).map(sprint => ({
            ...sprint,
            title: sprint.title || "Untitled Sprint",
            dateRange: sprint.dateRange || "N/A",
            tasks: (sprint.tasks ?? []).map(task => ({
                ...task,
                id: taskIdCounter++,
            }))
        }));

        const milestonesWithIds = (parsedPlan.milestones ?? []).map((milestone, index) => ({
            ...milestone,
            id: index,
        }));

        const certificationsWithIds = (parsedPlan.certifications ?? []).map((cert, index) => ({
            ...cert,
            id: index,
        }));
        
        const feedbackSource = parsedPlan.careerTeamFeedback || parsedPlan;

        const finalPlan: TransitionPlan = {
            summary: parsedPlan.summary || 'No summary was generated.',
            careerTeamFeedback: {
                overallImpression: feedbackSource.overallImpression || '',
                resumeFeedback: feedbackSource.resumeFeedback || '',
                skillsGapAnalysis: feedbackSource.skillsGapAnalysis || '',
                skillAssessments: feedbackSource.skillAssessments ?? [],
                leaveCalculationBreakdown: feedbackSource.leaveCalculationBreakdown,
            },
            skillsToDevelop: parsedPlan.skillsToDevelop ?? [],
            networkingSuggestions: parsedPlan.networkingSuggestions ?? [],
            projectIdeas: parsedPlan.projectIdeas ?? [],
            companyProspects: parsedPlan.companyProspects ?? [],
            milestones: milestonesWithIds,
            sprints: sprintsWithIds,
            certifications: certificationsWithIds,
        };

        return { plan: finalPlan, sources };

    } catch (error) {
        console.error("Error generating transition plan:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to generate a valid plan from the AI. The response was not in the expected format. Please try again.");
        }
        throw new Error("Failed to generate transition plan. The AI model may be overloaded or an error occurred.");
    }
};