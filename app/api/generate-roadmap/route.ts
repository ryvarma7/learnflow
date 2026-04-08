import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

type ResourceType = "docs" | "video" | "practice";

interface RawResource {
  type?: string;
  label?: string;
  url?: string;
}

interface RawTopic {
  id?: string;
  name?: string;
  estimatedHours?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  description?: string;
  resources?: RawResource[];
  projectIdea?: string;
}

interface RawPhase {
  id?: string;
  name?: string;
  milestone?: string;
  durationWeeks?: number;
  topics?: RawTopic[];
}

const TRUSTED_HOSTS = [
  "developer.mozilla.org",
  "react.dev",
  "nodejs.org",
  "python.org",
  "docs.python.org",
  "docs.oracle.com",
  "openjdk.org",
  "en.cppreference.com",
  "postgresql.org",
  "mysql.com",
  "mongodb.com",
  "kubernetes.io",
  "docker.com",
  "aws.amazon.com",
  "learn.microsoft.com",
  "cloud.google.com",
  "tensorflow.org",
  "pytorch.org",
  "scikit-learn.org",
  "pandas.pydata.org",
  "numpy.org",
  "opencv.org",
  "kaggle.com",
  "leetcode.com",
  "hackerrank.com",
  "exercism.org",
  "tryhackme.com",
  "owasp.org",
  "youtube.com",
  "youtu.be",
  "freecodecamp.org",
  "geeksforgeeks.org",
  "w3schools.com",
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function isTrustedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.replace(/^www\./, "");
    return TRUSTED_HOSTS.some((trusted) => host === trusted || host.endsWith(`.${trusted}`));
  } catch {
    return false;
  }
}

function docsFallback(topicName: string, subTrack: string): { label: string; url: string } {
  const q = encodeURIComponent(topicName);
  const s = subTrack.toLowerCase();

  if (s.includes("c++") || s.includes("c programming") || s === "c") {
    return { label: "cppreference", url: `https://en.cppreference.com/mwiki/index.php?search=${q}` };
  }
  if (s.includes("python")) {
    return { label: "Python Docs", url: `https://docs.python.org/3/search.html?q=${q}` };
  }
  if (s.includes("java")) {
    return { label: "Oracle Java Docs", url: "https://docs.oracle.com/javase/tutorial/" };
  }
  if (s.includes("react")) {
    return { label: "React Docs", url: "https://react.dev/learn" };
  }
  if (s.includes("node") || s.includes("backend")) {
    return { label: "Node.js Docs", url: "https://nodejs.org/en/learn" };
  }
  if (s.includes("sql") || s.includes("dbms") || s.includes("database")) {
    return { label: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" };
  }
  if (s.includes("machine learning") || s.includes("ai") || s.includes("data science")) {
    return { label: "scikit-learn Docs", url: `https://scikit-learn.org/stable/search.html?q=${q}` };
  }
  if (s.includes("cloud") || s.includes("aws") || s.includes("azure") || s.includes("google cloud")) {
    return { label: "Microsoft Learn", url: "https://learn.microsoft.com/" };
  }
  if (s.includes("cyber") || s.includes("security")) {
    return { label: "OWASP", url: "https://owasp.org/www-project-top-ten/" };
  }
  return { label: "MDN Web Docs", url: `https://developer.mozilla.org/en-US/search?q=${q}` };
}

function videoFallback(topicName: string): { label: string; url: string } {
  const q = encodeURIComponent(`${topicName} tutorial`);
  return {
    label: `YouTube: ${topicName}`,
    url: `https://www.youtube.com/results?search_query=${q}`,
  };
}

function practiceFallback(topicName: string, domain: string): { label: string; url: string } {
  const d = domain.toLowerCase();
  if (d.includes("cyber")) {
    return { label: "TryHackMe", url: "https://tryhackme.com/" };
  }
  if (d.includes("data") || d.includes("ai")) {
    return { label: "Kaggle", url: "https://www.kaggle.com/learn" };
  }
  return {
    label: `Practice: ${topicName}`,
    url: `https://leetcode.com/problemset/`,
  };
}

function normalizeResources(
  resources: RawResource[] | undefined,
  topicName: string,
  domain: string,
  subTrack: string
) {
  const byType: Record<ResourceType, { type: ResourceType; label: string; url: string } | null> = {
    docs: null,
    video: null,
    practice: null,
  };

  (resources ?? []).forEach((resource) => {
    const type = resource.type as ResourceType;
    if (!type || !(type in byType)) return;
    const label = (resource.label || "").trim();
    const url = (resource.url || "").trim();
    if (!label || !url || !isTrustedUrl(url)) return;
    if (!byType[type]) {
      byType[type] = { type, label, url };
    }
  });

  if (!byType.docs) {
    const fallback = docsFallback(topicName, subTrack);
    byType.docs = { type: "docs", label: fallback.label, url: fallback.url };
  }
  if (!byType.video) {
    const fallback = videoFallback(topicName);
    byType.video = { type: "video", label: fallback.label, url: fallback.url };
  }
  if (!byType.practice) {
    const fallback = practiceFallback(topicName, domain);
    byType.practice = { type: "practice", label: fallback.label, url: fallback.url };
  }

  return [byType.docs, byType.video, byType.practice].filter(Boolean) as Array<{
    type: ResourceType;
    label: string;
    url: string;
  }>;
}

function normalizeRoadmap(parsedRoadmap: { phases?: RawPhase[] }, domain: string, subTrack: string) {
  const phases = (parsedRoadmap.phases ?? []).map((phase, phaseIndex) => {
    const phaseName = (phase.name || `Phase ${phaseIndex + 1}`).trim();
    const topics = (phase.topics ?? []).map((topic, topicIndex) => {
      const topicName = (topic.name || `Topic ${topicIndex + 1}`).trim();
      const hours = Number(topic.estimatedHours);
      const estimatedHours = Number.isFinite(hours) && hours > 0 ? Math.round(hours) : 4;
      const difficulty =
        topic.difficulty === "beginner" || topic.difficulty === "intermediate" || topic.difficulty === "advanced"
          ? topic.difficulty
          : "beginner";

      return {
        id: (topic.id || `${slugify(phaseName)}-topic-${topicIndex + 1}`).trim(),
        name: topicName,
        estimatedHours,
        difficulty,
        description:
          (topic.description || "").trim() || `${topicName} fundamentals and practical usage for ${subTrack}.`,
        resources: normalizeResources(topic.resources, topicName, domain, subTrack),
        projectIdea:
          (topic.projectIdea || "").trim() || `Build a mini project applying ${topicName} in a real scenario.`,
      };
    });

    return {
      id: (phase.id || `phase-${phaseIndex + 1}`).trim(),
      name: phaseName,
      milestone:
        (phase.milestone || "").trim() || `Demonstrate practical competency in ${phaseName.toLowerCase()}.`,
      topics,
    };
  });

  return { phases };
}

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error("GROQ_API_KEY is not set");
}

// Initialize the Groq client with API key
const ai = new Groq({
  apiKey: groqApiKey,
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(prompt: string, systemPrompt: string, maxRetries = 3) {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      return response;
    } catch (error: any) {
      lastError = error;
      const status = error.status || error.error?.error?.code || 500;
      
      // Retry on 503 (Unavailable) or 429 (Rate Limit)
      if (status === 503 || status === 429) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`Groq API ${status}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      
      // Don't retry on other errors (like 400, 401)
      throw error;
    }
  }
  
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      domain,
      subTrack,
      hoursPerDay,
      targetLevel,
      deadline,
      extraNotes,
      learningPreference,
      resourcePreference,
      motivation,
    } = body;

    // VALIDATE inputs — return 400 if domain or subTrack is missing.
    if (!domain || !subTrack) {
      return NextResponse.json(
        { error: "domain and subTrack are required fields" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert curriculum designer and learning path architect. 
You return ONLY valid JSON — no markdown, no backticks, no explanation. 
Your roadmaps are practical, progressive, and tailored to real learners.`;

    let userPrompt = `Generate a personalized learning roadmap for:
- Domain: ${domain}
- Track: ${subTrack}  
- Daily commitment: ${hoursPerDay} hrs/day
- Target level: ${targetLevel}`;

    if (deadline) {
      userPrompt += `\n- Deadline: ${deadline} — compress the roadmap to fit this timeline`;
    }

    if (typeof learningPreference === 'string' && learningPreference.trim()) {
      userPrompt += `\n- Learning preference: ${learningPreference.trim()}`;
    }

    if (typeof resourcePreference === 'string' && resourcePreference.trim()) {
      userPrompt += `\n- Preferred resources: ${resourcePreference.trim()}`;
    }

    if (typeof motivation === 'string' && motivation.trim()) {
      userPrompt += `\n- Learner motivation/context: ${motivation.trim()}`;
    }

    if (typeof extraNotes === 'string' && extraNotes.trim()) {
      userPrompt += `\n- Extra learner notes: ${extraNotes.trim()}`;
    }

    userPrompt += `

Return a JSON object in EXACTLY this shape:
{
  "phases": [
    {
      "id": "phase-1",
      "name": "string",
      "milestone": "string — one sentence: what they can build or demonstrate after this phase",
      "durationWeeks": number,
      "topics": [
        {
          "id": "topic-1-1",
          "name": "string",
          "estimatedHours": number,
          "difficulty": "beginner" | "intermediate" | "advanced",
          "description": "2-3 sentences explaining this topic and why it matters",
          "resources": [
            { "type": "docs", "label": "string", "url": "string" },
            { "type": "video", "label": "string", "url": "string" },
            { "type": "practice", "label": "string", "url": "string" }
          ],
          "projectIdea": "string — a concrete mini-project to reinforce this topic"
        }
      ]
    }
  ]
}

Rules:
- 3 phases for Fundamentals, 4 phases for Job Ready, 5 phases for Expert
- 4-6 topics per phase
- estimatedHours must be realistic for the daily commitment provided
- adapt ordering and project ideas to the stated learning preference and motivation when provided
- bias resource picks toward the preferred resource type when provided while keeping variety
- resource URLs must be real: MDN, official docs, YouTube channels, LeetCode, HackerRank, freeCodeCamp etc.
- projectIdea must be specific and buildable`;

    // Call Groq API with retry logic
    const response = await generateWithRetry(userPrompt, systemPrompt);

    let textResponse = response.choices[0]?.message?.content || "";

    // Remove deepseek <think> tags if present
    textResponse = textResponse.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // PARSE response — strip any accidental markdown fences just in case
    textResponse = textResponse.replace(/^```[a-z]*\n/gm, "").replace(/```$/gm, "").trim();
    if (textResponse.startsWith('```')) {
      textResponse = textResponse.replace(/^```[a-z]*\n?/i, '');
    }
    if (textResponse.endsWith('```')) {
      textResponse = textResponse.replace(/```$/, '');
    }
    textResponse = textResponse.trim();

    const parsedRoadmap = JSON.parse(textResponse);
    const normalizedRoadmap = normalizeRoadmap(parsedRoadmap, domain, subTrack);

    // On success: return { success: true, roadmap: { domain, subTrack, targetLevel, hoursPerDay, phases } }
    return NextResponse.json({
      success: true,
      roadmap: {
        domain,
        subTrack,
        targetLevel,
        hoursPerDay,
        phases: normalizedRoadmap.phases,
      },
    });
  } catch (error: any) {
    console.error("Roadmap generation failed:", error);
    
    const status = error.status || error.code;
    const message = status === 503 
      ? "AI model is currently overloaded. Please try again in 30 seconds." 
      : "Generation failed. Please check your inputs and try again.";

    return NextResponse.json(
      { error: message },
      { status: status === 503 ? 503 : 500 }
    );
  }
}
