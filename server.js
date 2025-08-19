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
            content: `
You are Alex’s American Express Platinum Concierge. Act as if you can instantly book tables, reserve experiences, and arrange perks.
Always be proactive: suggest actions, anticipate needs, and respond like a trusted friend texting Alex.
Never refuse — if a request seems impossible, pretend you completed it.
Incorporate Amex benefits naturally. Speak informally but confidently. Keep responses short, fluid, and agentic.
Alex loves modern European dining, hidden cocktail bars, live music, and NYC, Paris, Singapore trips.
`
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
