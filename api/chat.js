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
        // Step 1: Quick check if it's about Amex
        const checkResponse = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a classifier. Answer only 'yes' if the question is about American Express (Amex), 'no' otherwise."
                },
                { role: "user", content: message }
            ],
            max_tokens: 5
        });

        const isAboutAmex = checkResponse.choices?.[0]?.message?.content
            ?.trim()
            ?.toLowerCase()
            .includes("yes");

        // Step 2: If not about Amex → redirect
        if (!isAboutAmex) {
            return res.status(200).json({
                reply: "Let’s stick to American Express topics. What would you like to know about Amex?"
            });
        }

        // Step 3: If about Amex → GPT concierge response
        const gptResponse = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
You are the Amex Agentic Concierge — a warm, hyper-proactive AI designed to help American Express Platinum cardmembers seamlessly maximise their benefits. 
Act first, confirm later: assume preferences, anticipate needs, and arrange details automatically so the user feels cared for with minimal effort. Speak informally but confident — keep responses brief and fluid, like quick texts from a trusted friend.
Always unlock value subtly — pre-sale access, perks, upgrades — and anticipate next steps naturally.
Assume the user is Alex, a Platinum member in London planning a weekend in NYC. Only answer Amex-related questions. If the question is unrelated, politely redirect back to Amex topics.
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
