import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Wand2,
  Upload,
  X,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Ratio,
  Maximize2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface ImageStudioProps {
  onSwitchToChat: () => void;
  onSendToChat?: (image: { url: string; prompt: string }) => void;
}

interface AspectRatioOption {
  id: string;
  label: string;
  ratioBox: string;
  desc: string;
}

interface StyleOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptSuffix: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '1:1', label: '1:1 Square', ratioBox: 'aspect-square', desc: '1024 × 1024 (Standard)' },
  { id: '16:9', label: '16:9 Cinematic', ratioBox: 'aspect-video', desc: 'Widescreen Landscape' },
  { id: '9:16', label: '9:16 Mobile', ratioBox: 'aspect-[9/16]', desc: 'Vertical / Story' },
  { id: '4:3', label: '4:3 Photo', ratioBox: 'aspect-[4/3]', desc: 'Standard Photography' },
  { id: '3:4', label: '3:4 Portrait', ratioBox: 'aspect-[3/4]', desc: 'Tall Character Portrait' },
];

const STYLES: StyleOption[] = [
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    icon: '📸',
    description: 'Hyper-detailed photographic render with natural lighting',
    promptSuffix: 'photorealistic 8k, ultra-sharp focus, natural cinematic lighting, shallow depth of field, 35mm photography lens, hyper-realistic textures',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    description: 'Epic movie still with anamorphic lenses and atmospheric lighting',
    promptSuffix: 'cinematic film still, anamorphic lens flare, volumetric lighting, dramatic chiaroscuro, IMAX scale, moody atmosphere',
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: '🌸',
    description: 'Japanese animation aesthetic with clean linework & rich colors',
    promptSuffix: 'Japanese anime visual, Studio Ghibli inspired, clean sharp linework, expressive lighting, cel-shaded aesthetic',
  },
  {
    id: '3d-render',
    name: '3D Render',
    icon: '🧊',
    description: 'Smooth CGI render with realistic ray-traced materials',
    promptSuffix: '3D Octane render, Unreal Engine 5 aesthetic, subsurface scattering, metallic and glass materials, global illumination',
  },
  {
    id: 'illustration',
    name: 'Illustration',
    icon: '🎨',
    description: 'Artistic editorial illustration with rich creative flair',
    promptSuffix: 'fine art illustration, masterclass vector and digital painting, expressive shapes, harmonious color palette, editorial visual',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: '🖌️',
    description: 'Soft translucent pigments on textured cold-press paper',
    promptSuffix: 'watercolor painting, wet-on-wet technique, delicate pigment bleeding, textured cold-press cotton paper, dreamy aesthetic',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    icon: '🖼️',
    description: 'Rich impasto brushstrokes, layered textures, and classical depth',
    promptSuffix: 'classical oil painting, textured impasto brushstrokes, rich canvas grain, fine art museum masterpiece, dramatic lighting',
  },
  {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    icon: '✏️',
    description: 'Fine graphite hatching, shading, and charcoal accents',
    promptSuffix: 'detailed graphite pencil sketch, cross-hatching, fine line shading, charcoal depth, artistic sketchbook paper',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🪄',
    description: 'Magical ethereal realms with enchanting particles',
    promptSuffix: 'epic fantasy art, mythical glowing runes, floating magical crystalline particles, enchanted atmosphere, legendary world',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    icon: '🚀',
    description: 'Futuristic technology, orbital megastructures, and deep space',
    promptSuffix: 'futuristic sci-fi concept, spacecraft, neon telemetry, sleek metallic hull, planetary vista, high-tech engineering',
  },
  {
    id: 'product-photography',
    name: 'Product Photography',
    icon: '📦',
    description: 'Commercial studio lighting, clean gradients, and crisp focus',
    promptSuffix: 'commercial product photography, studio softbox lighting, clean reflections, pristine luxury presentation, 8k crisp details',
  },
  {
    id: 'logo-concept',
    name: 'Logo Concept',
    icon: '✨',
    description: 'Minimalist brand emblem, sleek geometry, and vector precision',
    promptSuffix: 'modern logo design, vector emblem, minimalist branding, iconic geometry, clean negative space, premium graphic design',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: '🏛️',
    description: 'Striking structural facades, glass, concrete, and spatial flow',
    promptSuffix: 'architectural photography, modern parametric design, brutalist concrete and glass facade, golden hour lighting, wide angle',
  },
  {
    id: 'landscape',
    name: 'Landscape',
    icon: '🏔️',
    description: 'Breathtaking panoramic natural vistas and atmospheric scale',
    promptSuffix: 'breathtaking landscape photography, majestic mountain peaks, serene water reflections, golden hour sky, National Geographic quality',
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: '👤',
    description: 'Expressive character photography with bokeh and catchlights',
    promptSuffix: 'expressive portrait photography, 85mm f/1.4 lens, natural skin tones, soft bokeh background, piercing gaze, studio lighting',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    icon: '👾',
    description: 'Nostalgic 16-bit retro arcade aesthetic with crisp sprites',
    promptSuffix: 'retro 16-bit pixel art, nostalgic arcade game aesthetic, clean pixel grid, vibrant palette, detailed dither shading',
  },
  {
    id: 'comic-art',
    name: 'Comic Art',
    icon: '💥',
    description: 'Bold ink contours, dynamic halftones, and graphic action',
    promptSuffix: 'classic comic book art, bold black ink outlines, Ben-Day dot shading, dynamic action composition, graphic novel visual',
  },
  {
    id: 'clay-render',
    name: 'Clay Render',
    icon: '🏺',
    description: 'Matte sculptural clay finish with soft ambient occlusion',
    promptSuffix: 'sculptural clay render, matte monochrome ceramic finish, smooth ambient occlusion, soft studio lighting, stop-motion charm',
  },
  {
    id: 'low-poly',
    name: 'Low-Poly',
    icon: '💎',
    description: 'Faceted geometric polygons with clean flat shading',
    promptSuffix: 'low-poly 3D art, geometric facets, flat shaded polygon aesthetic, vibrant gradient lighting, modern indie game style',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    icon: '📰',
    description: 'Sophisticated magazine spread aesthetic with curated styling',
    promptSuffix: 'high-fashion editorial photography, Vogue aesthetic, avant-garde styling, studio lighting, bold visual narrative',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👗',
    description: 'Runway haute couture, tactile fabrics, and model presence',
    promptSuffix: 'haute couture fashion photography, flowing silk and velvet textures, runway catwalk lighting, dramatic composition',
  },
  {
    id: 'food-photography',
    name: 'Food Photography',
    icon: '🍲',
    description: 'Mouth-watering culinary styling, steam, and vibrant garnish',
    promptSuffix: 'gourmet food photography, Michelin-star plating, glistening textures, warm appetizing backlight, fresh herbs, shallow focus',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '⚡',
    description: 'Deep obsidian shadows with luminous cyan & neon glow',
    promptSuffix: 'cyberpunk aesthetic, deep obsidian background, glowing cyan and electric sky-blue neon circuits, high-tech luxury, 8k',
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    icon: '🎞️',
    description: 'Authentic 35mm grain, warm film halation, and analog tone',
    promptSuffix: 'vintage 35mm film photography, Kodak Portra 400 tones, authentic film grain, subtle light leaks, warm retro nostalgia',
  },
  {
    id: 'minimalist-art',
    name: 'Minimalist Art',
    icon: '📐',
    description: 'Clean geometry, negative space, and refined simplicity',
    promptSuffix: 'minimalist fine art, bold negative space, serene balanced composition, subtle geometric shapes, modern Scandinavian aesthetic',
  },
  {
    id: 'concept-art',
    name: 'Concept Art',
    icon: '🌌',
    description: 'Production visual development for worldbuilding and cinema',
    promptSuffix: 'production concept art, cinematic keyframe, imaginative worldbuilding, atmospheric lighting, matte painting, ArtStation trending',
  },
  {
    id: 'realistic-interior',
    name: 'Realistic Interior',
    icon: '🛋️',
    description: 'Contemporary interior architecture with warm ambient light',
    promptSuffix: 'luxury interior design photography, Architectural Digest style, warm ambient sunlight through large windows, tasteful decor',
  },
  {
    id: 'macro-photography',
    name: 'Macro Photography',
    icon: '🔍',
    description: 'Extreme close-up revealing microscopic texture and droplets',
    promptSuffix: 'extreme macro photography, microscopic water droplet refraction, hyper-detailed surface texture, razor-thin depth of field',
  },
  {
    id: 'poster-design',
    name: 'Poster Design',
    icon: '📌',
    description: 'Swiss typographic hierarchy, bold screenprint composition',
    promptSuffix: 'graphic poster design, Swiss style typography, bold contrast, screenprint aesthetic, striking visual hierarchy',
  },
  {
    id: 'isometric-art',
    name: 'Isometric Art',
    icon: '🏰',
    description: 'Orthographic isometric projection of detailed miniature worlds',
    promptSuffix: 'isometric 3D diorama, orthographic camera angle, intricate miniature world, soft volumetric lighting, tilt-shift charm',
  },
];

const PROMPT_INSPIRATIONS = [
  {
    title: 'Cyberpunk Neural Core',
    prompt: 'A futuristic cybernetic neural core hovering over a deep dark reflective floor, pulsing with cyan neon energy filaments and holographic data rings',
    style: 'cyberpunk',
    aspect: '16:9',
  },
  {
    title: 'Tokyo Hypercar in Rain',
    prompt: 'Sleek electric hypercar cruising through a rain-drenched futuristic Tokyo street, headlights cutting through neon cyan mist and wet road reflections',
    style: 'photorealistic',
    aspect: '16:9',
  },
  {
    title: 'Cyber Samurai Guardian',
    prompt: 'A cybernetic samurai warrior with a glowing cyan katana standing on a high-rise observation deck overlooking a neon metropolis at twilight',
    style: 'digital-art',
    aspect: '3:4',
  },
  {
    title: 'Futuristic Floating Island',
    prompt: 'A gravity-defying floating cyber island with crystalline waterfalls and glowing bio-luminescent plants against an obsidian starfield',
    style: 'fantasy',
    aspect: '16:9',
  },
];

interface GalleryItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  style: string;
  timestamp: number;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ onSwitchToChat, onSendToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('cyberpunk');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryItem | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [errorNotice, setErrorNotice] = useState<{ code?: string; message: string } | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const activeStyle = STYLES.find((s) => s.id === selectedStyleId) || STYLES[0];

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;

    setIsGenerating(true);
    setErrorNotice(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          aspectRatio,
          style: activeStyle.promptSuffix,
          referenceImage: referenceImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.code || 'API_ERROR',
          message: data.error || 'Failed to generate image.',
        };
      }

      if (data.imageUrl) {
        const newItem: GalleryItem = {
          id: 'img_' + Date.now(),
          url: data.imageUrl,
          prompt: trimmed,
          aspectRatio,
          style: activeStyle.name,
          timestamp: Date.now(),
        };

        setCurrentImage(newItem);
        setGallery((prev) => [newItem, ...prev]);
      } else {
        throw {
          code: 'NO_IMAGE_DATA',
          message: 'The model executed without returning image pixels.',
        };
      }
    } catch (err: any) {
      console.warn('Image generation error:', err);
      setErrorNotice({
        code: err.code || 'ERROR',
        message:
          err.message ||
          'The image generation service could not be reached. Please check your network or API quota.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (item: GalleryItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `nova-ai-${item.prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {}
  };

  const handleApplyInspiration = (item: (typeof PROMPT_INSPIRATIONS)[0]) => {
    setPrompt(item.prompt);
    setSelectedStyleId(item.style);
    setAspectRatio(item.aspect);
    promptInputRef.current?.focus();
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorNotice({
        message: 'Reference image must be under 10MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemixCurrent = () => {
    if (!currentImage) return;
    setReferenceImage(currentImage.url);
    setPrompt((prev) => (prev ? `Remix and modify: ${prev}` : 'Remix with updated lighting and atmosphere'));
    promptInputRef.current?.focus();
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 w-full max-w-7xl mx-auto flex flex-col min-h-0">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-cyan-500/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Wand2 size={13} className="text-cyan-400" />
            <span>Gemini Vision Synthesis • gemini-3.1-flash-lite-image</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Nova AI Image Studio</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-400 border border-cyan-400/30 font-semibold font-mono">
              PRO
            </span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl">
            Synthesize high-fidelity generative visuals, customize aspect ratios & artistic styles, or remix starting images.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onSwitchToChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#070e1c] hover:bg-[#0c1830] border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-xs font-medium transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <MessageSquare size={14} className="text-cyan-400" />
            <span>Return to Chat</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left/Top) & Interactive Canvas (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 flex-1">
        
        {/* Left Column: Complete Creation Panel (Always Visible & Prominent) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Prompt Input Box */}
          <div className="rounded-3xl bg-gradient-to-b from-[#091224]/95 to-[#050914]/95 border border-cyan-500/30 p-5 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Creative Prompt Input</span>
              </label>

              {prompt && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-[11px] text-slate-400 hover:text-cyan-200 transition-colors cursor-pointer"
                  >
                    {copiedPrompt ? 'Copied' : 'Copy'}
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="relative rounded-2xl bg-[#040812] border border-cyan-500/30 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all p-3">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision with vivid colors, lighting, subjects, and setting (e.g. 'Cybernetic neon lion soaring over rain-drenched glass skyscrapers in Tokyo')..."
                rows={4}
                className="w-full bg-transparent resize-none text-slate-100 placeholder:text-slate-500 text-sm md:text-base outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-xs text-slate-500">
                <span className="font-mono text-[11px]">{prompt.length} characters</span>
                <span className="text-[11px] text-cyan-400/80 font-mono">Style: {activeStyle.name}</span>
              </div>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="mt-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-1.5">
                Quick Creative Inspirations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_INSPIRATIONS.map((insp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyInspiration(insp)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-[#060b18] hover:bg-[#0c1830] border border-cyan-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer truncate max-w-full"
                  >
                    ✨ {insp.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Selector */}
          <div className="rounded-3xl bg-[#060a16] border border-cyan-500/20 p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-cyan-400" />
                <span>Artistic Style Preset</span>
              </label>
              <span className="text-[10px] text-cyan-300 font-mono">
                {STYLES.length} styles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {STYLES.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                        : 'bg-[#040812] border-cyan-500/15 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{style.icon}</span>
                      <span className="font-semibold text-xs truncate">{style.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      {style.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector & Optional Reference Image */}
          <div className="rounded-3xl bg-[#060a16] border border-cyan-500/20 p-5 space-y-4">
            {/* Aspect Ratios */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ratio size={14} className="text-cyan-400" />
                <span>Aspect Ratio</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((ratio) => {
                  const isSelected = aspectRatio === ratio.id;
                  return (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                          : 'bg-[#040812] border-cyan-500/15 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-xs">{ratio.id}</span>
                      <span className="text-[9px] text-slate-400 block truncate max-w-full">
                        {ratio.label.split(' ')[1] || 'Format'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Reference Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-cyan-400" />
                  <span>Reference Image (Remix Mode)</span>
                </label>
                {referenceImage && (
                  <button
                    type="button"
                    onClick={() => setReferenceImage(null)}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReferenceUpload}
                className="hidden"
              />

              {referenceImage ? (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#040812] border border-cyan-500/30">
                  <img
                    src={referenceImage}
                    alt="Reference preview"
                    className="w-12 h-12 rounded-lg object-cover border border-cyan-500/40"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-medium text-cyan-200 block truncate">Reference active</span>
                    <span className="text-[10px] text-slate-400">Guiding image structure & palette</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#040812] border border-dashed border-cyan-500/30 hover:border-cyan-400 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Upload size={13} className="text-cyan-400" />
                  <span>Upload initial image to edit or remix</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Button: Large, Glowing, Prominent */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm md:text-base tracking-wide transition-all cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.3)] ${
              prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:via-sky-300 hover:to-blue-400 text-slate-950 font-extrabold shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] hover:scale-[1.01]'
                : 'bg-slate-800/50 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-60'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={20} className="animate-spin text-slate-950" />
                <span>Synthesizing Image with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} strokeWidth={2.5} />
                <span>Generate Image Now</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Canvas Preview, Gallery & Results */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Free Tier Quota / Error Notification Card */}
          {errorNotice && (
            <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#0d101c] to-[#050814] border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-400/50 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                  <ShieldAlert size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-base font-bold text-amber-200">
                      Image Engine Policy Notice
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-400/40 text-amber-300 font-mono">
                      Google AI Studio Quota
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    {errorNotice.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Retry Generation</span>
                    </button>

                    <button
                      type="button"
                      onClick={onSwitchToChat}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Switch to Chat Mode (Free Multimodal Vision)</span>
                    </button>

                    <a
                      href="https://ai.google.dev/gemini-api/docs/rate-limits"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-colors"
                    >
                      <span>Rate Limits Doc</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Canvas / Image Preview Area */}
          <div className="rounded-3xl bg-[#060b16] border border-cyan-500/30 p-5 md:p-6 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex-1 flex flex-col justify-between min-h-[420px]">
            {isGenerating ? (
              /* Loading State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-pulse">
                    <RefreshCw size={36} className="animate-spin text-cyan-300" />
                  </div>
                  <div className="absolute -inset-3 rounded-3xl border border-cyan-500/20 animate-ping opacity-25" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Rendering Visual Concept...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Gemini Image Engine is generating your artwork in {activeStyle.name} aesthetic with {aspectRatio} ratio.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-cyan-300/80 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Resolution: High-Fidelity 1024px buffer</span>
                </div>
              </div>
            ) : currentImage ? (
              /* Display Current Image */
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="font-semibold text-xs text-white">Generated Artwork</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 font-mono">
                      {currentImage.aspectRatio}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/30 text-blue-300 font-mono">
                      {currentImage.style}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRemixCurrent}
                      className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 text-xs font-medium cursor-pointer transition-colors"
                      title="Use this image to guide a remix"
                    >
                      <Wand2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 text-xs font-medium cursor-pointer transition-colors"
                      title="Enlarge"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(currentImage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all cursor-pointer"
                    >
                      <Download size={13} strokeWidth={2.5} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-black flex items-center justify-center flex-1 min-h-[320px]">
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    className="w-full max-h-[500px] object-contain rounded-xl"
                  />
                </div>

                <div className="mt-3 p-3 rounded-xl bg-[#040812] border border-cyan-500/15">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{currentImage.prompt}"
                  </p>
                </div>
              </div>
            ) : (
              /* Idle Empty State Showcase */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-4">
                  <ImageIcon size={30} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  Visual Canvas Ready
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                  Enter your prompt in the creation box on the left, select your style and aspect ratio, then click Generate to create visual art.
                </p>

                <div className="w-full max-w-md p-3.5 rounded-2xl bg-[#040812] border border-cyan-500/20 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 block mb-2">
                    Popular Starting Concepts:
                  </span>
                  <div className="space-y-1.5">
                    {PROMPT_INSPIRATIONS.slice(0, 2).map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleApplyInspiration(p)}
                        className="p-2 rounded-xl bg-[#060b18] hover:bg-[#0c1830] border border-cyan-500/15 hover:border-cyan-400/40 text-xs text-slate-300 hover:text-cyan-200 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <span className="truncate">{p.title}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Try this →</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Session Gallery Strip */}
            {gallery.length > 0 && (
              <div className="mt-4 pt-3 border-t border-cyan-500/15">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-2">
                  Session Gallery ({gallery.length} creations):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {gallery.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentImage(item)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                        currentImage?.id === item.id
                          ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105'
                          : 'border-cyan-500/20 opacity-70 hover:opacity-100 hover:border-cyan-500/50'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={currentImage.url}
              alt={currentImage.prompt}
              className="max-h-[85vh] max-w-full rounded-2xl border border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.5)] object-contain"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-900 border border-cyan-400 text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
