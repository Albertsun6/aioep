import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Load Skill Prompt template
function loadPrompt(subSkill: string): string {
    const promptPath = path.resolve(
        process.cwd(),
        "../skills/strategy-modeling/prompts",
        `${subSkill}.prompt.md`
    );
    if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, "utf-8");
    }
    return "";
}

// Load feedback patterns for context enrichment
function loadFeedbackPatterns(): string {
    const patternsPath = path.resolve(
        process.cwd(),
        "../skills/strategy-modeling/feedback/patterns.md"
    );
    if (fs.existsSync(patternsPath)) {
        return fs.readFileSync(patternsPath, "utf-8");
    }
    return "";
}

export async function POST(req: Request) {
    const body = await req.json();
    const { subSkill, input, existingModel } = body;

    if (!subSkill || !input) {
        return NextResponse.json(
            { error: "subSkill and input are required" },
            { status: 400 }
        );
    }

    const validSubSkills = [
        "extract-drivers",
        "derive-goals",
        "decompose-initiatives",
        "spawn-projects",
        "validate-model",
    ];

    if (!validSubSkills.includes(subSkill)) {
        return NextResponse.json(
            { error: `Invalid subSkill. Must be one of: ${validSubSkills.join(", ")}` },
            { status: 400 }
        );
    }

    // Load the system prompt for this sub-skill
    const systemPrompt = loadPrompt(subSkill);
    if (!systemPrompt) {
        return NextResponse.json(
            { error: `Prompt template not found for sub-skill: ${subSkill}` },
            { status: 500 }
        );
    }

    // Load feedback patterns for self-correction context
    const feedbackPatterns = loadFeedbackPatterns();

    // Build the full prompt with context
    const fullSystemPrompt = feedbackPatterns
        ? `${systemPrompt}\n\n## 历史修正模式（参考以避免重复错误）\n\n${feedbackPatterns}`
        : systemPrompt;

    // Build user message
    let userMessage = `请分析以下输入：\n\n${input}`;
    if (existingModel) {
        userMessage += `\n\n已有模型上下文：\n${JSON.stringify(existingModel, null, 2)}`;
    }

    // Call OpenAI API (or fallback to mock for dev)
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        // Dev mode: return a placeholder response
        return NextResponse.json({
            subSkill,
            status: "mock",
            message:
                "AI API key not configured. Set OPENAI_API_KEY to enable AI-assisted modeling.",
            systemPromptLoaded: true,
            systemPromptLength: fullSystemPrompt.length,
            feedbackPatternsLoaded: !!feedbackPatterns,
        });
    }

    try {
        const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": "https://aioep.dev",
                "X-Title": "AIOEP Strategy Modeling",
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-4o",
                messages: [
                    { role: "system", content: fullSystemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            return NextResponse.json(
                { error: `AI API error: ${errText}` },
                { status: 502 }
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        let parsedResult;
        try {
            // Strategy 1: Direct JSON parse
            parsedResult = JSON.parse(content.trim());
        } catch {
            try {
                // Strategy 2: Extract JSON from markdown code fences
                const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
                if (fenceMatch) {
                    parsedResult = JSON.parse(fenceMatch[1].trim());
                } else {
                    // Strategy 3: Find first { and last } to extract JSON object
                    const firstBrace = content.indexOf("{");
                    const lastBrace = content.lastIndexOf("}");
                    if (firstBrace !== -1 && lastBrace > firstBrace) {
                        parsedResult = JSON.parse(content.slice(firstBrace, lastBrace + 1));
                    } else {
                        parsedResult = { raw: content };
                    }
                }
            } catch {
                parsedResult = { raw: content };
            }
        }

        return NextResponse.json({
            subSkill,
            status: "success",
            result: parsedResult,
            metadata: {
                model: data.model,
                usage: data.usage,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: `Failed to call AI API: ${error.message}` },
            { status: 500 }
        );
    }
}
