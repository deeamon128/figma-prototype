import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();
const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is working!");
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        // Create a system rule to force conversation to Amex
        const systemMessage = {
            role: "system",
            content: "You are a helpful assistant that only answers questions about American Express (Amex). " +
                "If the question is unrelated to Amex, politely steer the conversation back to Amex topics."
        };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    systemMessage,
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        // Safety check in case API doesn't return expected structure
        const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't process your request.";
        res.json({ reply });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error talking to GPT");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
