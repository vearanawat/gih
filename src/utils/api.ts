export const askChatbot = async (message: string) => {
    const response = await fetch("/chatbot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });
    return response.json();
};
