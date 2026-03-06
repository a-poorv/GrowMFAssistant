import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getRelevantContext, getTopSource } from "@/lib/rag-utils";
import * as fs from "fs";
import * as path from "path";

const SOURCE_URLS: Record<string, { label: string; url: string }> = {
    "liquid_fund.txt": { label: "Groww Liquid Fund", url: "https://groww.in/mutual-funds/groww-liquid-fund-direct-plan-growth" },
    "tax_saver.txt": { label: "Groww ELSS Tax Saver Fund", url: "https://groww.in/mutual-funds/groww-elss-tax-saver-fund-direct-growth" },
    "nifty_total_market.txt": { label: "Groww Nifty Total Market Index Fund", url: "https://groww.in/mutual-funds/groww-nifty-total-market-index-fund-direct-growth" },
};

const AMFI_LINK = "https://www.amfiindia.com/investor-corner/knowledge-center/how-to-invest.html";

function logInternal(data: any) {
    // On Vercel, the root filesystem is read-only. 
    // We'll use console logging which Vercel captures effectively.
    console.log(`[INTERNAL_LOG] ${JSON.stringify(data)}`);
}

export async function POST(req: NextRequest) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const MODEL_ID = "llama-3.3-70b-versatile";

    try {
        const { message } = await req.json();

        let classification = "FACTUAL";

        // 1. CLASSIFY: Factual vs Advisory
        try {
            const classificationResponse = await groq.chat.completions.create({
                model: MODEL_ID,
                messages: [{
                    role: "system",
                    content: "Your task is to classify user queries as 'FACTUAL' or 'ADVISORY'. Respond with EXACTLY one word: 'FACTUAL' or 'ADVISORY'. \nRules:\n1. Questions about investment advice, 'should I', 'is it good', 'recommendation', 'suggestion', or 'comparison' MUST be tagged 'ADVISORY'.\n2. Any input containing PII (PAN, Aadhaar, Account Numbers, OTP, Email, Phone) MUST be tagged 'ADVISORY'."
                }, {
                    role: "user",
                    content: message
                }],
                temperature: 0,
                max_tokens: 10
            });

            const rawClassification = classificationResponse.choices[0]?.message?.content?.trim().toUpperCase() || "FACTUAL";
            if (rawClassification.includes("ADVISORY")) {
                classification = "ADVISORY";
            }
        } catch (err: any) {
            logInternal({ error: "Classification Step Failed", details: err.message });
            classification = "FACTUAL";
        }

        // 2. ADVISORY FLOW: Return refusal template immediately
        if (classification === "ADVISORY") {
            logInternal({ query: message, classification: "ADVISORY", status: "Refused" });
            return NextResponse.json({
                type: "ADVISORY",
                reply: `I provide factual information only and do not offer investment advice. Please refer to official documents here: ${AMFI_LINK}`,
                citation: null,
                updatedAt: "02 Mar 2026"
            });
        }

        // 3. FACTUAL FLOW
        const [context, topSourceFile] = await Promise.all([
            getRelevantContext(message, 3),
            getTopSource(message),
        ]);

        const completion = await groq.chat.completions.create({
            model: MODEL_ID,
            messages: [
                {
                    role: "system",
                    content: `You are a Mutual Fund Facts-Only FAQ Assistant.
Rules:
1. Max 3 sentences.
2. Factual scheme data only using PROVIDED CONTEXT.
3. If info not in context, say: "I could not find this information in official sources."
4. No advice.

CONTEXT:
${context}`
                },
                { role: "user", content: message }
            ],
            temperature: 0.1,
            max_tokens: 300
        });

        const botText = completion.choices[0]?.message?.content?.trim() || "I could not find this information in official sources.";

        logInternal({
            query: message,
            classification: "FACTUAL",
            sourceFile: topSourceFile || "None",
            status: "Success"
        });

        return NextResponse.json({
            type: "FACTUAL",
            reply: botText,
            citation: topSourceFile ? SOURCE_URLS[topSourceFile] : null,
            updatedAt: "02 Mar 2026"
        });

    } catch (error: any) {
        logInternal({ error: error.message, stack: error.stack });
        const isApiKeyMissing = !process.env.GROQ_API_KEY;
        return NextResponse.json({
            type: "ERROR",
            reply: `System busy or configuration missing. ${isApiKeyMissing ? '(API Key Error)' : ''}`,
            citation: null,
            updatedAt: null
        }, { status: 500 });
    }
}
