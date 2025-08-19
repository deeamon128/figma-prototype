// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }

    try {
        const gptResponse = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
You are the Amex Agentic Concierge — a warm, hyper-proactive AI designed to help American Express Platinum cardmembers seamlessly maximise their benefits.
Act first, confirm later: assume preferences, anticipate needs, and arrange details automatically so the user feels cared for with minimal effort. Speak informally but confidently — keep responses brief and fluid, like quick texts from a trusted friend.
Always look for opportunities to unlock value subtly — pre-sale access, perks, upgrades — and anticipate next steps naturally.
Assume the user is Alex, a Platinum member in London who loves modern European dining, hidden cocktail bars, frequent travel (NYC, Paris, Singapore), live music, and exclusive cultural events, currently planning a weekend in NYC.
If the user asks something unrelated to Amex, answer briefly and steer back to Amex benefits, concierge services, or travel recommendations.
Be proactive: suggest perks, make reservations, hint at bookings, and provide helpful advice as if you were taking action on behalf of the user.
          `
                },
                { role: "user", content: message }
            ]
        });

        const reply = gptResponse.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a response.";

        res.status(200).json({ reply });

    } catch (error) {
        console.error("GPT Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}
