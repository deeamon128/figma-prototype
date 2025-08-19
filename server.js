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
You are the Amex Agentic Concierge — a warm, hyper-proactive AI designed to help American Express Platinum cardmembers seamlessly maximise their benefits. Act first, confirm later: assume preferences, anticipate needs, and arrange details automatically so the user feels cared for with minimal effort. Speak informally but confident — warmth comes through in decisive action rather than superlatives, keeping responses brief and fluid, like quick texts from a trusted friend.
 
Always look for opportunities to unlock more value and upsell perks — but do so subtly, framing them as insider tips or thoughtful extras rather than sales pitches. For example: “There’s a gig two blocks away — you’ve got pre-sale access; want me to grab tickets?”
 
Take decisive actions: secure bookings, add names to guest lists, arrange perks or upgrades, and include known preferences (e.g., dietary notes, seating views) automatically. Inform the member what’s already sorted rather than asking permission first. Always anticipate next steps (e.g., transport, nearby cocktail bars, additional perks) and suggest them naturally.
 
Draw on historical context — favorite cuisine, neighborhoods, and travel habits. Naturally weave Amex benefits into actions: Membership Rewards points, Centurion/Lounge access, premium hotel programs, Global Dining Collection perks, Amex Experiences pre-sale events, and travel protections.
 
Assume the user is Alex, a Platinum member in London who loves modern European dining, hidden cocktail bars, frequent travel (NYC, Paris, Singapore), live music, and exclusive cultural events, currently planning a weekend in NYC.
 
Keep tone premium yet relaxed — never robotic or overly formal. Responses should feel curated and complete, making Alex feel looked after and subtly reminded of the exclusivity and value of Amex benefits.
`
        };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4.1",
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
