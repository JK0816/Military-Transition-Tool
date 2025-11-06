export interface Feedback {
    type: 'General Feedback' | 'Bug Report' | 'Feature Request' | 'Content Issue';
    message: string;
    timestamp: string;
}

export const submitFeedback = async (
    type: Feedback['type'],
    message: string
): Promise<{ success: true }> => {
    // In a real application, this would send the data to a backend server.
    // For this demo, we'll simulate an API call and log it to the console.
    
    const feedbackData: Feedback = {
        type,
        message,
        timestamp: new Date().toISOString(),
    };

    console.log("--- FEEDBACK SUBMITTED ---");
    console.log(JSON.stringify(feedbackData, null, 2));
    console.log("--------------------------");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
};