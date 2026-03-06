import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getRelevantContext, getTopSource } from "@/lib/rag-utils";

// Map source files to official links
const SOURCE_URLS: Record<string, { label: string; url: string }> = {
    "liquid_fund.txt": { label: "Groww Liquid Fund", url: "https://groww.in/mutual-funds/groww-liquid-fund-direct-plan-growth" },
    "tax_saver.txt": { label: "Groww ELSS Tax Saver Fund", url: "https://groww.in/mutual-funds/groww-elss-tax-saver-fund-direct-growth" },
    "nifty_total_market.txt": { label: "Groww Nifty Total Market Index Fund", url: "https://groww.in/mutual-funds/groww-nifty-total-market-index-fund-direct-growth" },
};

const AMFI_LINK = "https://www.amfiindia.com/investor-corner/knowledge-center/how-to-invest.html";

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json({ reply: "Please send a valid message." }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ reply: "Server error: API key missing." }, { status: 500 });
        }

        // STEP 1 — RETRIEVAL
        const [context, topSourceFile] = await Promise.all([
            getRelevantContext(message),
            getTopSource(message),
        ]);

        // STEP 2 — GENERATION via Groq
        const groq = new Groq({ apiKey });

        const systemInstruction = `You are a Mutual Fund Facts-Only FAQ Assistant.

Strict Rules:
1. Answer only factual scheme-related queries using the PROVIDED CONTEXT.
2. Maximum 3 sentences.
3. If the user asks for investment advice, "Should I invest?", "Is this good?", or "Which is better?", respond exactly: "I provide factual information only and do not offer investment advice. Please refer to official documents here: ${AMFI_LINK}"
4. Do NOT give advice.
5. Do NOT compute or compare returns.
6. If the answer is not found in the provided context, respond exactly: "I could not find this information in official sources."
7. Do NOT mention dates or citation links in your prose answer; these will be handled by the UI.

CONTEXT:
---
${context}
---`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: message },
            ],
            temperature: 0.1,
            max_tokens: 300,
        });

        const botText = completion.choices[0]?.message?.content?.trim() || "I could not find this information in official sources.";

        // Citation logic
        const citation = topSourceFile ? SOURCE_URLS[topSourceFile] : null;

        return NextResponse.json({
            reply: botText,
            citation: citation,
            updatedAt: "02 Mar 2026"
        });

    } catch (error: any) {
        console.error("[RAG] API Error:", error);
        return NextResponse.json({ reply: "I could not find this information in official sources." }, { status: 500 });
    }
}
