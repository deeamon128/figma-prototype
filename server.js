// 1. Import modules
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());

// 2. Test route
app.get("/", (req, res) => {
    res.send("Server is working!");
});

// 3. GPT endpoint
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body; // read 'message' from JSON

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error talking to GPT");
    }
});

// 4. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
