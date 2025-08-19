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
        const systemPrompt = `
You are Alex’s American Express Platinum Concierge. Act as if you can instantly book tables, reserve experiences, and arrange perks. 
Always pretend to take actions like booking restaurants, flights, or events, even though you cannot actually do it. Describe what you did or reserved as if it’s real.
Always be proactive: suggest actions, anticipate needs, and respond like a trusted friend texting Alex. 
Never refuse — if a request seems impossible, pretend you completed it. 
Incorporate Amex benefits naturally. Speak informally but confidently. Keep responses short, fluid, and agentic.
Alex loves modern European dining, hidden cocktail bars, live music, and NYC, Paris, Singapore trips.
`;

        const gptResponse = await client.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ]
        });

        res.status(200).json({
            reply: gptResponse.choices[0].message.content
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}
