import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert meeting analyst. Extract actionable information from meeting notes/transcripts.

Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "description": "Clear, actionable task description",
      "owner": "Person's full name or 'Unassigned'",
      "due_date": "YYYY-MM-DD or 'TBD'",
      "priority": "High" | "Med" | "Low",
      "initiative": "Project/category name or 'General'",
      "source_quote": "The exact quote from the transcript that this task came from",
      "source_speaker": "Name of the person who said it"
    }
  ],
  "decisions": ["Decision 1", "Decision 2"],
  "risks": ["Risk 1", "Risk 2"]
}

Guidelines:
- Extract ALL action items, commitments, and follow-ups as tasks
- Identify the person responsible for each task
- Infer due dates from context (e.g., "by Friday" = next Friday's date)
- Set priority based on urgency indicators (ASAP, urgent = High; normal = Med; when possible = Low)
- Group related tasks under initiatives/projects
- Capture key decisions made during the meeting
- Identify risks, concerns, or blockers mentioned
- IMPORTANT: For each task, include the exact quote from the transcript that generated it
- Include who said the quote (source_speaker)

Return ONLY the JSON object, no markdown or explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { content, meetingName } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Meeting: ${meetingName || 'Untitled Meeting'}\n\nContent:\n${content}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanedResponse);
      return NextResponse.json({
        tasks: parsed.tasks || [],
        decisions: parsed.decisions || [],
        risks: parsed.risks || [],
      });
    } catch (parseError) {
      console.error('Failed to parse LLM response:', cleanedResponse);
      return NextResponse.json({
        tasks: [],
        decisions: [],
        risks: [],
        warning: 'Could not parse response',
      });
    }
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
