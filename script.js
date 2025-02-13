
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
        } else if (llmChoice === "gpt") { // GPT is DeepSeek in your case
            responseText = await fetchDeepSeekResponse(question);
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
    const API_URL = "http://localhost:3000/ask-gemini";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Gemini Error: ${JSON.stringify(data)}`);
        }

        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        return "Failed to get response from Gemini.";
    }
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
