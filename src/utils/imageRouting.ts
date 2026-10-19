export interface ImageRoutingDecision {
  isImageRequest: boolean;
  prompt: string;
  aspectRatio: string;
  style?: string;
  confidence: 'high' | 'medium' | 'low';
}

const SUPPORTED_ASPECT_RATIOS: Record<string, string> = {
  '16:9': '16:9',
  landscape: '16:9',
  wide: '16:9',
  widescreen: '16:9',
  horizontal: '16:9',
  '9:16': '9:16',
  portrait: '9:16',
  vertical: '9:16',
  mobile: '9:16',
  story: '9:16',
  '4:3': '4:3',
  '3:4': '3:4',
  '1:1': '1:1',
  square: '1:1',
};

const STYLES_KEYWORDS: Record<string, string> = {
  cyberpunk: 'Cyberpunk Neon',
  neon: 'Cyberpunk Neon',
  photorealistic: 'Photorealistic 8K',
  realistic: 'Photorealistic 8K',
  photo: 'Photorealistic 8K',
  anime: 'Anime / Manga',
  manga: 'Anime / Manga',
  ghibli: 'Anime / Manga',
  '3d': '3D Unreal Engine',
  render: '3D Unreal Engine',
  cinematic: 'Cinematic Sci-Fi',
  movie: 'Cinematic Sci-Fi',
  fantasy: 'Mythical Fantasy',
  vector: 'Minimalist Vector',
  illustration: 'Digital Art',
  painting: 'Oil Painting',
};

export function detectImageGenerationIntent(input: string): ImageRoutingDecision {
  if (!input || typeof input !== 'string') {
    return { isImageRequest: false, prompt: '', aspectRatio: '1:1', confidence: 'low' };
  }

  const raw = input.trim();

  // Exclude meta-questions about image generation
  const isQuestionAboutImage =
    /^(can you|do you|are you able to|how do|how can|what is|tell me how|why can't|why don't|explain how)\b/i.test(
      raw
    ) && !/^(please\s+)?(generate|create|draw|make|render)\b/i.test(raw);

  if (isQuestionAboutImage) {
    return { isImageRequest: false, prompt: raw, aspectRatio: '1:1', confidence: 'low' };
  }

  // English Image Request Patterns
  const englishPatterns = [
    /^(?:please\s+)?(?:generate|create|render|paint|design|produce)\s+(?:an?\s+)?(?:image|picture|photo|artwork|illustration|graphic|visual|portrait)(?:\s+of|\s+depicting|\s+showing|\s+with|\s*:)?\s*(.+)$/i,
    /^(?:please\s+)?(?:draw|sketch|paint)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|photo\s+of\s+)?(.+)$/i,
    /^(?:make|produce)\s+(?:an?\s+)?(?:image|picture|photo|drawing|illustration)\s+(?:of\s+)?(.+)$/i,
    /^(?:image|picture|photo)\s*(?:of|:)\s*(.+)$/i,
    /^(?:generate\s+image|create\s+image|ai\s+image)(?:\s*:)?\s*(.+)$/i,
    /\b(?:generate\s+(?:an?\s+)?image\s+of|draw\s+(?:an?\s+)?picture\s+of)\s+(.+)$/i,
  ];

  // Hindi & Hinglish Image Request Patterns
  const hindiHinglishPatterns = [
    /^(?:kripya\s+)?(?:ek\s+)?(?:image|picture|photo|tasveer|chitra|drawing)\s+(?:banao|bana do|banaiye|generate karo|create karo)\s*:?\s*(.+)$/i,
    /^(.+)\s+(?:ki\s+)?(?:image|picture|photo|tasveer|chitra)\s+(?:banao|bana do|banaiye|generate karo|create karo)$/i,
    /^(?:ek\s+)?(?:image|picture|photo|tasveer|chitra)\s+(?:chahiye|dikhao)\s*:?\s*(.+)$/i,
    /^(?:draw\s+karo|paint\s+karo)\s*:?\s*(.+)$/i,
    /^(?:mujhe\s+)?(.+)\s+(?:ki\s+photo|ki\s+image|ki\s+tasveer)\s+chahiye$/i,
  ];

  let detectedPrompt = '';
  let matchFound = false;

  for (const regex of englishPatterns) {
    const match = raw.match(regex);
    if (match && match[1]) {
      detectedPrompt = match[1].trim();
      matchFound = true;
      break;
    }
  }

  if (!matchFound) {
    for (const regex of hindiHinglishPatterns) {
      const match = raw.match(regex);
      if (match && match[1]) {
        detectedPrompt = match[1].trim();
        matchFound = true;
        break;
      }
    }
  }

  if (!matchFound) {
    return { isImageRequest: false, prompt: raw, aspectRatio: '1:1', confidence: 'low' };
  }

  // Extract aspect ratio from prompt if mentioned
  let aspectRatio = '1:1';
  let cleaned = detectedPrompt;

  const ratioMatch = cleaned.match(/\b(16:9|9:16|4:3|3:4|1:1|landscape|portrait|widescreen|square)\b/i);
  if (ratioMatch) {
    const key = ratioMatch[1].toLowerCase();
    if (SUPPORTED_ASPECT_RATIOS[key]) {
      aspectRatio = SUPPORTED_ASPECT_RATIOS[key];
      cleaned = cleaned.replace(ratioMatch[0], '').replace(/\s+(?:aspect\s+ratio|ratio|format)\b/i, '').trim();
    }
  }

  // Extract style if mentioned
  let detectedStyle: string | undefined;
  for (const [kw, styleName] of Object.entries(STYLES_KEYWORDS)) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(cleaned)) {
      detectedStyle = styleName;
      break;
    }
  }

  // Final cleanup of prompt
  cleaned = cleaned.replace(/^[:,\-\s]+/, '').replace(/[:,\-\s]+$/, '');
  if (!cleaned) {
    cleaned = raw;
  }

  return {
    isImageRequest: true,
    prompt: cleaned,
    aspectRatio,
    style: detectedStyle,
    confidence: 'high',
  };
}
