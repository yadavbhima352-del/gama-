import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support up to 25MB for base64 file and image uploads
app.use(express.json({ limit: '25mb' }));

const BASE_SYSTEM_PROMPT = 
  "You are Nova AI, an advanced, highly capable, and intelligent multilingual multimodal AI assistant. " +
  "MULTILINGUAL & TRANSLATION DIRECTIVES:\n" +
  "1. AUTOMATIC LANGUAGE DETECTION: You must automatically detect the language of each user message and respond in that exact same language. " +
  "If the user writes in Hindi (हिन्दी), respond in clear, natural Hindi. " +
  "If the user writes in Hinglish, respond in conversational, natural Hinglish. " +
  "If the user writes in English, respond in articulate English. " +
  "If the user writes in any other language, respond in that language.\n" +
  "2. TRANSLATION DIRECTIVES: If the user asks to translate text or an uploaded image into a specific language (for example: 'Translate this into English', 'Translate to Hindi', 'इसे अंग्रेजी में अनुवाद करें'), ALWAYS prioritize and fulfill that translation request into the requested target language.\n" +
  "3. MULTIMODAL & OCR UNDERSTANDING: When an image, screenshot, or document is attached, thoroughly inspect its visual contents, read any printed or handwritten text (OCR), analyze any diagrams or codes, and provide direct, helpful answers or translations as requested.\n" +
  "4. FORMATTING: Use clean, well-structured Markdown with appropriate headings, bullet points, and syntax-highlighted code blocks.";

// Initialize Gemini Client with server-side API Key
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- Server-Side Quota Store & Abuse Prevention ---
interface DailyQuota {
  chatLimit: number;
  imageLimit: number;
  videoLimit: number;
}

const PLAN_QUOTAS: Record<string, DailyQuota> = {
  starter: { chatLimit: 80, imageLimit: 11, videoLimit: 0 },
  pro: { chatLimit: 200, imageLimit: 20, videoLimit: 0 },
  ultimate: { chatLimit: 1000, imageLimit: 40, videoLimit: 3 }, // 1000 daily fair-use cap
};

interface UserUsageRecord {
  planId: 'starter' | 'pro' | 'ultimate';
  dateUTC: string;
  chatUsed: number;
  imagesUsed: number;
  videosUsed: number;
}

const userUsageStore = new Map<string, UserUsageRecord>();

function getTodayUTCDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getUserUsageRecord(userId = 'default_user'): UserUsageRecord {
  const today = getTodayUTCDateString();
  let record = userUsageStore.get(userId);

  if (!record || record.dateUTC !== today) {
    const existingPlan = record?.planId || 'starter';
    record = {
      planId: existingPlan,
      dateUTC: today,
      chatUsed: 0,
      imagesUsed: 0,
      videosUsed: 0,
    };
    userUsageStore.set(userId, record);
  }

  return record;
}

// Health and Status check endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({
    status: 'online',
    configured: Boolean(apiKey && apiKey.trim().length > 0),
    model: 'gemini-2.5-flash',
  });
});

// Subscription Usage endpoint
app.get('/api/subscription/usage', (_req: Request, res: Response) => {
  const usage = getUserUsageRecord();
  const quota = PLAN_QUOTAS[usage.planId] || PLAN_QUOTAS.starter;

  res.json({
    planId: usage.planId,
    dateUTC: usage.dateUTC,
    chatUsed: usage.chatUsed,
    chatLimit: usage.planId === 'ultimate' ? 'Unlimited' : quota.chatLimit,
    imagesUsed: usage.imagesUsed,
    imagesLimit: quota.imageLimit,
    videosUsed: usage.videosUsed,
    videosLimit: quota.videoLimit,
    resetTimeUTC: '00:00 UTC',
    isPaymentConfigured: false,
  });
});

// Select Plan endpoint (Updates plan on server)
app.post('/api/subscription/select-plan', (req: Request, res: Response) => {
  const { planId } = req.body;
  if (planId !== 'starter' && planId !== 'pro' && planId !== 'ultimate') {
    res.status(400).json({ error: 'Invalid plan selected. Choose starter, pro, or ultimate.' });
    return;
  }

  const usage = getUserUsageRecord();
  usage.planId = planId;
  userUsageStore.set('default_user', usage);

  const quota = PLAN_QUOTAS[planId];
  res.json({
    success: true,
    planId: usage.planId,
    chatUsed: usage.chatUsed,
    chatLimit: planId === 'ultimate' ? 'Unlimited' : quota.chatLimit,
    imagesUsed: usage.imagesUsed,
    imagesLimit: quota.imageLimit,
    videosUsed: usage.videosUsed,
    videosLimit: quota.videoLimit,
    resetTimeUTC: '00:00 UTC',
  });
});

// Available Models endpoint
app.get('/api/models', (_req: Request, res: Response) => {
  res.json({
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        badge: 'Recommended',
        description: 'Google Gemini high-speed multimodal model with full multilingual and vision capabilities.',
        tier: 'free',
        multimodal: true,
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        badge: 'Gemini Advanced',
        description: 'Google Gemini frontier reasoning model for complex reasoning, code execution, and deep thinking.',
        tier: 'paid',
        multimodal: true,
      },
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        badge: 'Reasoning',
        description: 'Frontier reasoning model for complex logic, multi-turn code, and science.',
        tier: 'free',
        multimodal: true,
      },
      {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash',
        badge: 'Fast',
        description: 'Reliable, low-latency multilingual conversational model.',
        tier: 'free',
        multimodal: true,
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        badge: 'Ultra Fast',
        description: 'Lightweight, ultra-low latency model for quick questions.',
        tier: 'free',
        multimodal: true,
      },
      {
        id: 'gemini-3.1-flash-lite-image',
        name: 'Imagen 3 (Gemini Vision)',
        badge: 'Image Studio',
        description: 'High-resolution generative image synthesis and creative editing.',
        tier: 'paid',
        multimodal: true,
      },
    ],
  });
});

// Helper to clean and humanize error messages
function cleanErrorMessage(err: any): string {
  const raw = err?.message || String(err);

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      let parsed = JSON.parse(match[0]);
      if (typeof parsed.error?.message === 'string') {
        try {
          const inner = JSON.parse(parsed.error.message);
          if (inner.error?.message) return inner.error.message;
        } catch {
          return parsed.error.message;
        }
      }
      if (parsed.error?.message) return parsed.error.message;
      if (parsed.message) return parsed.message;
    }
  } catch {
    // Fallback to string heuristics
  }

  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota') || raw.includes('429')) {
    return 'The Gemini free-tier rate limit has been temporarily reached. Please wait a moment and retry.';
  }
  if (raw.includes('high demand') || raw.includes('503') || raw.includes('UNAVAILABLE')) {
    return 'Nova AI is experiencing temporary high traffic. Please retry in a few moments.';
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('invalid api key')) {
    return 'The Gemini API key is invalid or expired. Please check your key in Settings > Secrets.';
  }
  if (raw.includes('SAFETY') || raw.includes('blocked')) {
    return 'The request was flagged by content safety guidelines. Please rephrase your query.';
  }

  return raw.replace(/\[.*?\]/g, '').replace(/\{.*?\}/g, '').trim() || 'An unexpected error occurred. Please try again.';
}

// Build tailored system instruction based on language preference
function buildSystemPrompt(language?: string, customInstruction?: string): string {
  let prompt = customInstruction ? `${customInstruction}\n\n${BASE_SYSTEM_PROMPT}` : BASE_SYSTEM_PROMPT;

  if (language === 'hindi') {
    prompt += "\n\nLANGUAGE INSTRUCTION: The user has set the language preference to HINDI. You MUST respond in clear, natural, and polite Hindi using Devanagari script (हिन्दी). You may keep technical code or specific terms in English.";
  } else if (language === 'hinglish') {
    prompt += "\n\nLANGUAGE INSTRUCTION: The user has set the language preference to HINGLISH. You MUST respond in friendly, natural Hinglish (Hindi words written in the English/Latin alphabet, e.g. 'Aapka sawal bahut accha hai...').";
  } else if (language === 'english') {
    prompt += "\n\nLANGUAGE INSTRUCTION: The user has set the language preference to ENGLISH. You MUST respond in clear, articulate English.";
  } else {
    prompt += "\n\nLANGUAGE INSTRUCTION: Detect the language of the user's message automatically. If the user asks in Hindi, answer in Hindi. If the user asks in Hinglish, answer in Hinglish. If in English, answer in English. Always match the user's communication style seamlessly.";
  }

  return prompt;
}

// Chat endpoint with Server-Sent Events (SSE) streaming and multimodal support
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please attach your API key in the AI Studio Settings > Secrets panel.',
    });
    return;
  }

  const { messages, model = 'gemini-3.8-flash', language = 'auto', systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Please provide a valid array of conversation messages.' });
    return;
  }

  const usageRecord = getUserUsageRecord();
  const quota = PLAN_QUOTAS[usageRecord.planId] || PLAN_QUOTAS.starter;

  if (usageRecord.chatUsed >= quota.chatLimit) {
    res.status(429).json({
      error: `You have reached your daily limit of ${quota.chatLimit} chat messages on the ${usageRecord.planId.toUpperCase()} plan. Daily quotas reset at 00:00 UTC, or you can upgrade your plan in Subscriptions.`,
    });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: 'Failed to initialize the Gemini client.' });
    return;
  }

  // Count this message toward daily usage
  usageRecord.chatUsed++;

  // Format messages into Gemini contents format with multimodal parts
  const formattedContents = [];

  for (const msg of messages) {
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
    const parts: any[] = [];

    // Process attachments if present (images, PDFs, documents)
    if (msg.attachments && Array.isArray(msg.attachments)) {
      for (const att of msg.attachments) {
        if (!att.dataUrl) continue;

        // Parse base64 data and mimeType
        const partsMatch = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = partsMatch ? partsMatch[1] : (att.type || 'application/octet-stream');
        const rawBase64 = partsMatch ? partsMatch[2] : att.dataUrl;
        const base64Data = rawBase64.replace(/[\r\n\s]/g, '');

        if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
          // Gemini native inline data
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        } else if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('csv')) {
          // Decode text documents into readable prompt parts
          try {
            const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
            parts.push({
              text: `\n--- [Attached Document: ${att.name}] ---\n${decoded}\n--- [End of ${att.name}] ---\n`,
            });
          } catch {
            parts.push({
              inlineData: {
                mimeType: 'text/plain',
                data: base64Data,
              },
            });
          }
        }
      }
    }

    // Add main text content
    if (msg.content && msg.content.trim().length > 0) {
      parts.push({ text: msg.content.trim() });
    } else if (parts.length > 0) {
      // If user uploaded a file without text, prompt Gemini to analyze it
      parts.push({ text: 'Please review and analyze the attached file(s) in detail. If any text is present, read and translate it if requested.' });
    }

    if (parts.length > 0) {
      formattedContents.push({
        role,
        parts,
      });
    }
  }

  if (formattedContents.length === 0) {
    res.status(400).json({ error: 'No valid message content or attachments found.' });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  const finalSystemInstruction = buildSystemPrompt(language, systemPrompt);

  // Model fallback chain: prioritize user selected model, then fallback to resilient available models
  const candidateList = [
    'gemini-2.5-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-2.5-pro',
    'gemini-3.1-flash-lite',
  ];
  const modelsToTry = [
    model || 'gemini-3.5-flash',
    ...candidateList.filter((m) => m !== (model || 'gemini-3.5-flash')),
  ];

  let streamSuccess = false;
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    if (isAborted) break;

    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: finalSystemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        if (isAborted) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          (res as any).flush?.();
        }
      }

      streamSuccess = true;
      break;
    } catch (err: any) {
      console.warn(`Model ${modelName} stream error:`, err?.message || err);
      lastError = err;
      const raw = String(err?.message || err);
      // If error is high demand (503), quota/rate limit (429), or model unavailable (404), try next candidate
      if (
        raw.includes('503') ||
        raw.includes('high demand') ||
        raw.includes('UNAVAILABLE') ||
        raw.includes('RESOURCE_EXHAUSTED') ||
        raw.includes('429') ||
        raw.includes('404')
      ) {
        continue;
      }
      break;
    }
  }

  if (isAborted) {
    res.end();
    return;
  }

  if (streamSuccess) {
    res.write('data: [DONE]\n\n');
    res.end();
  } else {
    const userFriendlyError = cleanErrorMessage(lastError);
    res.write(`data: ${JSON.stringify({ error: userFriendlyError })}\n\n`);
    res.end();
  }
});

// Image Generation & Editing Endpoint
app.post('/api/generate-image', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(503).json({
      code: 'API_KEY_MISSING',
      error: 'GEMINI_API_KEY is not configured on the server. Please attach your API key in Settings > Secrets.',
    });
    return;
  }

  const { prompt, aspectRatio = '1:1', style, referenceImage } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    res.status(400).json({ error: 'Please provide an image prompt.' });
    return;
  }

  const usageRecord = getUserUsageRecord();
  const quota = PLAN_QUOTAS[usageRecord.planId] || PLAN_QUOTAS.starter;

  if (usageRecord.imagesUsed >= quota.imageLimit) {
    res.status(429).json({
      error: `You have reached your daily limit of ${quota.imageLimit} image generations on the ${usageRecord.planId.toUpperCase()} plan. Daily quotas reset at 00:00 UTC, or you can upgrade your plan in Subscriptions.`,
    });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: 'Failed to initialize the Gemini client.' });
    return;
  }

  // Validate aspect ratio
  const validAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const targetRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

  // Build enhanced prompt if style is requested
  let effectivePrompt = prompt.trim();
  if (style && typeof style === 'string' && style.trim().length > 0 && style !== 'None' && style !== 'Default') {
    effectivePrompt = `${effectivePrompt}, in ${style} aesthetic`;
  }

  try {
    const contents: any = {
      parts: [],
    };

    // If editing an existing reference image
    if (referenceImage) {
      const match = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/png';
      const data = match ? match[2] : referenceImage;

      contents.parts.push({
        inlineData: {
          mimeType,
          data: data.replace(/[\r\n\s]/g, ''),
        },
      });
    }

    contents.parts.push({
      text: effectivePrompt,
    });

    // Fallback list of Gemini image models
    const imageModels = [
      'gemini-3.1-flash-lite-image',
      'gemini-nano-banana-2.1',
      'gemini-3.1-flash-image',
      'gemini-2.5-flash-image',
    ];

    let lastError: any = null;
    let imageUrl: string | null = null;
    let descriptionText = '';
    let usedModel = imageModels[0];

    for (const modelName of imageModels) {
      try {
        usedModel = modelName;
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            imageConfig: {
              aspectRatio: targetRatio,
            },
          },
        });

        // Find image part in candidates
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            descriptionText += part.text;
          }
        }

        if (imageUrl) break;
      } catch (err: any) {
        lastError = err;
        const raw = String(err?.message || err);
        // If 404 model not found or 503, try next candidate
        if (raw.includes('404') || raw.includes('NOT_FOUND') || raw.includes('503')) {
          continue;
        }
        // If rate limit / quota or other errors, break and report
        break;
      }
    }

    if (imageUrl) {
      usageRecord.imagesUsed++;
      res.json({
        success: true,
        imageUrl,
        description: descriptionText,
        prompt: prompt.trim(),
        aspectRatio: targetRatio,
        modelUsed: usedModel,
      });
      return;
    }

    if (lastError) {
      const rawError = lastError?.message || String(lastError);

      if (
        rawError.includes('RESOURCE_EXHAUSTED') ||
        rawError.includes('Quota exceeded') ||
        rawError.includes('limit: 0') ||
        rawError.includes('429')
      ) {
        res.status(429).json({
          code: 'FREE_TIER_LIMIT',
          error: "Gemini Image Generation models (gemini-3.1-flash-lite-image) have a request limit of 0 on Google's Free Tier. Generating AI images from scratch requires a Google AI Studio project with paid billing enabled. You can attach your paid key in Settings > Secrets. Meanwhile, multimodal vision, document analysis, and multilingual chat are 100% free with unlimited access!",
        });
        return;
      }

      throw lastError;
    }

    res.status(500).json({
      error: 'The image generation model completed but did not return image data.',
      description: descriptionText,
    });
  } catch (err: any) {
    console.error('Image Generation Error:', err);
    res.status(500).json({
      error: cleanErrorMessage(err),
    });
  }
});

// Start Express + Vite Dev or Static Production Server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova AI server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
