const API_KEYS = {
    gemini: "AIzaSyDk9r39Qau0lCEQQx-0NxrF25IRok0OOXM", // Replace with your actual Gemini API key
    gpt: "YOUR_OPENAI_API_KEY" // Replace with your actual OpenAI API key
};

document.getElementById("qa-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent page reload

    const question = document.getElementById("question").value.trim();
    const llmChoice = document.getElementById("llm-selector").value;
    const answerFormat = document.getElementById("format-selector").value;
    const responseArea = document.getElementById("response-area");

    if (!question) {
        alert("Please enter a question.");
        return;
    }

    responseArea.innerHTML = "<strong>Processing...</strong>";

    try {
        let responseText = "";

        if (llmChoice === "gemini") {
            responseText = await fetchGemini(question);
        } else if (llmChoice === "gpt") {
            responseText = await fetchGPT(question);
        }

        // Format response based on user selection
        responseText = formatResponse(responseText, answerFormat);

        responseArea.innerHTML = `<strong>Response:</strong><br>${responseText}`;
    } catch (error) {
        console.error("Error:", error);
        responseArea.innerHTML = "<strong>Error fetching response.</strong>";
    }
});

async function fetchGemini(question) {
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEYS.gemini}`;
    
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: question }] }],
        })
    });

    const data = await response.json();

    // Extract the response text
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
}

async function fetchGPT(question) {
    const API_URL = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEYS.gpt}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: question }],
            temperature: 0.7
        })
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "No response received from GPT.";
}

// Function to format the response based on user selection
function formatResponse(response, formatType) {
    switch (formatType) {
        case "bullet-points":
            return response.split(". ").map(sentence => `• ${sentence}`).join("<br>");
        case "detailed-example":
            return `<strong>Example:</strong> ${response}`;
        case "caveman":
            return response.replace(/\bis\b/g, "be").replace(/\bare\b/g, "be").replace(/\bthe\b/g, "").replace(/\bto\b/g, "").toUpperCase();
        case "layman":
            return `In simple words: ${response}`;
        default:
            return response;
    }
}
