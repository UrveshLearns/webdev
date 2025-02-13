require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow frontend requests

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("Gemini API Key:", GEMINI_API_KEY); // Add this line


// Route to handle Gemini API requests
app.post('/ask-gemini', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${JSON.stringify(data)}`);
        }

        res.json({ answer: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received" });
    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        res.status(500).json({ error: "Failed to get response from Gemini" });
    }
    async function fetchGemini(question) {
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] })
            });
    
            const data = await response.json();
            console.log("Gemini API Response:", data); // Log the response for debugging
            
            if (!response.ok) {
                throw new Error(`Gemini API Error: ${JSON.stringify(data)}`);
            }
    
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
        } catch (error) {
            console.error("Error fetching Gemini response:", error);
            return "Failed to get response from Gemini.";
        }
    }
    
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
