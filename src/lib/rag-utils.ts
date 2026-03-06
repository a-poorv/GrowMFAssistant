import * as fs from "fs";
import * as path from "path";

export interface Chunk {
    text: string;
    source: string;
    fundName?: string;
}

// ─── Stop words to ignore during keyword scoring ───────────────────────────
const STOP_WORDS = new Set([
    "the", "and", "for", "that", "this", "with", "have", "from",
    "are", "was", "will", "what", "how", "does", "does", "about",
    "tell", "me", "can", "you", "is", "a", "an", "of", "in", "to",
    "please", "help", "give", "show", "explain", "get", "do",
]);

// ─── Synonym / alias map for financial terms ───────────────────────────────
const SYNONYMS: Record<string, string[]> = {
    sip: ["systematic investment plan", "monthly investment", "min sip"],
    elss: ["tax saver", "tax saving", "80c", "section 80c", "tax benefit"],
    nav: ["net asset value", "price", "current value"],
    aum: ["assets under management", "fund size", "corpus"],
    expense: ["expense ratio", "ter", "fee", "cost", "charges"],
    exit: ["exit load", "redemption charge", "withdrawal charge"],
    return: ["returns", "performance", "annual returns", "cagr", "growth"],
    risk: ["risk level", "risk rating", "volatility", "safe", "risky"],
    liquid: ["liquid fund", "liquidity", "short term", "money market"],
    nifty: ["nifty total market", "index fund", "passive fund"],
    manager: ["fund manager", "portfolio manager", "managed by"],
    redemption: ["redeem", "withdraw", "sell", "exit"],
    lock: ["lock-in", "lock in", "lockin", "3 year"],
    invest: ["investment", "invest in", "start investing", "minimum", "min investment"],
    benchmark: ["benchmark index", "index name", "bench mark", "tracked index"],
};

/**
 * Expands a query word into all its synonyms and variants
 */
function expandQuery(word: string): string[] {
    const lower = word.toLowerCase();
    const expansions = [lower];
    for (const [key, aliases] of Object.entries(SYNONYMS)) {
        if (lower === key || aliases.some(a => a.includes(lower) || lower.includes(a))) {
            expansions.push(key, ...aliases);
        }
    }
    return [...new Set(expansions)];
}

/**
 * 1. DATA LOADER — Reads all .txt files from data/raw and produces chunks.
 *    Each paragraph / FAQ entry becomes a separate chunk.
 */
function loadChunks(): Chunk[] {
    try {
        const dataDir = path.join(process.cwd(), "data", "raw");
        if (!fs.existsSync(dataDir)) {
            console.warn("[RAG] data/raw directory not found.");
            return [];
        }

        const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".txt"));
        const chunks: Chunk[] = [];

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            const content = fs.readFileSync(filePath, "utf-8");

            // Extract fund name from first line if present
            const firstLine = content.split("\n")[0]?.trim() ?? "";
            const fundName = firstLine.startsWith("Fund Name:")
                ? firstLine.replace("Fund Name:", "").trim()
                : file.replace(".txt", "");

            // Split into sections by double newline
            const sections = content.split(/\r?\n\r?\n+/);
            for (const section of sections) {
                const trimmed = section.trim();
                if (trimmed.length > 20) {
                    chunks.push({ text: trimmed, source: file, fundName });
                }
            }

            // Also create one "full file" chunk as fallback context
            chunks.push({
                text: `FULL SUMMARY — ${fundName}:\n${content.trim()}`,
                source: file,
                fundName,
            });
        }

        console.log(`[RAG] Loaded ${chunks.length} chunks from ${files.length} files.`);
        return chunks;
    } catch (error) {
        console.error("[RAG] Error loading data:", error);
        return [];
    }
}

// Cache chunks in memory (they don't change at runtime)
let _cachedChunks: Chunk[] | null = null;
function getChunks(): Chunk[] {
    if (!_cachedChunks) {
        _cachedChunks = loadChunks();
    }
    return _cachedChunks;
}

/**
 * 2. RETRIEVAL — Keyword + synonym scoring with TF-style weighting.
 *    Returns the top-K most relevant chunks as a single context string.
 */
export async function getRelevantContext(query: string, topK = 5): Promise<string> {
    const chunks = getChunks();
    if (chunks.length === 0) {
        return "No knowledge base data found. Please add .txt files to data/raw/.";
    }

    // Tokenise query, remove stop words, expand synonyms
    const rawWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const queryTerms = rawWords
        .filter(w => !STOP_WORDS.has(w))
        .flatMap(expandQuery);
    const uniqueTerms = [...new Set(queryTerms)];

    console.log(`[RAG] Query terms after expansion: ${uniqueTerms.join(", ")}`);

    // Score each chunk
    const scored = chunks.map(chunk => {
        const chunkLower = chunk.text.toLowerCase();
        let score = 0;

        for (const term of uniqueTerms) {
            // Count occurrences (term frequency boost)
            const occurrences = (chunkLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
            score += occurrences * 2;

            // Bonus if term appears in the first 100 chars (title/heading area)
            if (chunkLower.slice(0, 100).includes(term)) score += 3;
        }

        // Penalise overly short chunks (< 50 chars) slightly
        if (chunk.text.length < 50) score *= 0.5;

        return { ...chunk, score };
    });

    const topChunks = scored
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    if (topChunks.length === 0) {
        // Fallback: return first full-summary chunk from each file
        console.warn("[RAG] No keyword match found; using fallback context.");
        const fallback = chunks
            .filter(c => c.text.startsWith("FULL SUMMARY"))
            .slice(0, 2);
        return fallback.length > 0
            ? fallback.map(c => c.text).join("\n\n---\n\n")
            : chunks.slice(0, 3).map(c => c.text).join("\n\n---\n\n");
    }

    const contextString = topChunks
        .map(c => `[Source: ${c.fundName ?? c.source}]\n${c.text}`)
        .join("\n\n---\n\n");

    console.log(`[RAG] Returning ${topChunks.length} chunks, top score: ${topChunks[0].score}`);
    return contextString;
}

/**
 * 3. CITATION HELPER — Returns the source filename of the highest scoring chunk.
 */
export async function getTopSource(query: string): Promise<string | null> {
    const chunks = getChunks();
    const rawWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const queryTerms = rawWords.filter(w => !STOP_WORDS.has(w)).flatMap(expandQuery);
    const uniqueTerms = [...new Set(queryTerms)];

    if (uniqueTerms.length === 0) return null;

    let bestScore = -1;
    let bestSource: string | null = null;

    for (const chunk of chunks) {
        const chunkLower = chunk.text.toLowerCase();
        let score = 0;
        for (const term of uniqueTerms) {
            const occurrences = (chunkLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
            score += occurrences * 2;
            if (chunkLower.slice(0, 100).includes(term)) score += 3;
        }

        if (score > bestScore) {
            bestScore = score;
            bestSource = chunk.source;
        }
    }

    return bestScore > 0 ? bestSource : null;
}
