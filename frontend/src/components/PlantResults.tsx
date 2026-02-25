import React, { useEffect, useState } from 'react';
import type { Plant, PlantNeed } from '../backend';
import { NeedCategory, NeedStatus, PlantEmotion } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface PlantResultsProps {
  result: Plant;
  imagePreview: string;
  onReset: () => void;
}

interface NeedConfig {
  emoji: string;
  label: string;
  goodLabel: string;
  attentionLabel: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  badgeText: string;
}

const NEED_CONFIG: Record<string, NeedConfig> = {
  [NeedCategory.sunlight]: {
    emoji: '☀️',
    label: 'Sunlight',
    goodLabel: 'Getting Enough Sun!',
    attentionLabel: 'Needs More Light!',
    borderColor: 'border-nature-earth/50',
    bgColor: 'bg-nature-earth/10',
    badgeBg: 'bg-nature-earth/20',
    badgeText: 'text-black',
  },
  [NeedCategory.soil]: {
    emoji: '🌱',
    label: 'Soil',
    goodLabel: 'Soil is Perfect!',
    attentionLabel: 'Soil Needs Help!',
    borderColor: 'border-nature-forest/50',
    bgColor: 'bg-nature-forest/10',
    badgeBg: 'bg-nature-forest/20',
    badgeText: 'text-black',
  },
  [NeedCategory.water]: {
    emoji: '💧',
    label: 'Water',
    goodLabel: 'Well Watered!',
    attentionLabel: 'Needs More Water!',
    borderColor: 'border-nature-mint/50',
    bgColor: 'bg-nature-mint/10',
    badgeBg: 'bg-nature-mint/20',
    badgeText: 'text-black',
  },
  [NeedCategory.airQuality]: {
    emoji: '🌬️',
    label: 'Air Quality',
    goodLabel: 'Fresh Air!',
    attentionLabel: 'Needs Better Air!',
    borderColor: 'border-nature-sage/50',
    bgColor: 'bg-nature-sage/10',
    badgeBg: 'bg-nature-sage/20',
    badgeText: 'text-black',
  },
  [NeedCategory.pestPresence]: {
    emoji: '🐛',
    label: 'Pests',
    goodLabel: 'No Pests Found!',
    attentionLabel: 'Pests Detected!',
    borderColor: 'border-nature-green/50',
    bgColor: 'bg-nature-green/10',
    badgeBg: 'bg-nature-green/20',
    badgeText: 'text-black',
  },
};

const CATEGORY_ORDER = [
  NeedCategory.sunlight,
  NeedCategory.water,
  NeedCategory.soil,
  NeedCategory.airQuality,
  NeedCategory.pestPresence,
];

interface EmotionConfig {
  emoji: string;
  label: string;
  message: string;
  bgColor: string;
  borderColor: string;
  animation: string;
}

const EMOTION_CONFIG: Record<string, EmotionConfig> = {
  [PlantEmotion.happy]: {
    emoji: '😊',
    label: "Your plant is HAPPY! 😊",
    message: "Woohoo! Your plant is feeling GREAT today! It loves you so much! Keep up the amazing work! 🌟💚",
    bgColor: 'bg-nature-green/15',
    borderColor: 'border-nature-green',
    animation: 'animate-tree-bounce',
  },
  [PlantEmotion.sad]: {
    emoji: '😢',
    label: "Your plant is SAD! 😢",
    message: "Aww, your plant needs some extra love today! Give it a little hug and check what it needs! 💚🌿",
    bgColor: 'bg-nature-mint/15',
    borderColor: 'border-nature-mint',
    animation: 'animate-glow-pulse',
  },
  [PlantEmotion.angry]: {
    emoji: '😠',
    label: "Your plant is ANGRY! 😠",
    message: "Uh oh! Your plant is a little grumpy right now! Let's fix things up and make it smile again! 💪🌱",
    bgColor: 'bg-nature-earth/15',
    borderColor: 'border-nature-earth',
    animation: 'animate-sparkle-twinkle',
  },
  [PlantEmotion.worried]: {
    emoji: '😟',
    label: "Your plant is WORRIED! 😟",
    message: "Your plant is feeling a bit nervous! Don't worry — you're here to help! Everything will be okay! 🌸✨",
    bgColor: 'bg-nature-sage/15',
    borderColor: 'border-nature-sage',
    animation: 'animate-heart-float',
  },
  [PlantEmotion.upset]: {
    emoji: '😤',
    label: "Your plant is UPSET! 😤",
    message: "Your plant is feeling frustrated! But YOU can make it better! Show it some love and care! 🌟💚",
    bgColor: 'bg-nature-forest/15',
    borderColor: 'border-nature-forest',
    animation: 'animate-glow-pulse',
  },
};

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const CELEBRATION_EMOJIS = ['🌟', '✨', '🌿', '🍃', '💚', '🌸', '⭐', '🎉'];

/** Cute tree hero with sparkle/heart accents and glow */
function CuteTreeHero() {
  return (
    <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full animate-glow-pulse" />
      {/* Sparkle top-right */}
      <span
        className="absolute -top-1 -right-1 text-sm animate-sparkle-twinkle select-none pointer-events-none"
        style={{ animationDelay: '0s' }}
        aria-hidden="true"
      >
        ✨
      </span>
      {/* Heart bottom-left */}
      <span
        className="absolute -bottom-1 -left-1 text-sm animate-heart-float select-none pointer-events-none"
        style={{ animationDelay: '0.5s' }}
        aria-hidden="true"
      >
        💚
      </span>
      {/* Flower top-left */}
      <span
        className="absolute -top-1 -left-1 text-xs animate-sparkle-twinkle select-none pointer-events-none"
        style={{ animationDelay: '1s' }}
        aria-hidden="true"
      >
        🌸
      </span>
      {/* Tree */}
      <span
        className="text-5xl animate-tree-bounce tree-glow-lg select-none inline-block"
        role="img"
        aria-label="Cute willow tree helper"
      >
        🌳
      </span>
    </div>
  );
}

/** Plant Emotion Card displayed prominently above the need cards */
function EmotionCard({ emotion }: { emotion: string }) {
  const config = EMOTION_CONFIG[emotion] ?? EMOTION_CONFIG[PlantEmotion.happy];

  return (
    <div
      className={`rounded-3xl border-2 ${config.borderColor} ${config.bgColor} p-6 text-center space-y-3 shadow-candy`}
    >
      {/* Big animated emotion emoji */}
      <div
        className={`text-8xl leading-none select-none inline-block ${config.animation}`}
        role="img"
        aria-label={config.label}
        style={{ display: 'block' }}
      >
        {config.emoji}
      </div>

      {/* Bold emotion label */}
      <h3 className="text-2xl font-bold text-black tracking-wide">
        {config.label}
      </h3>

      {/* Child-friendly message */}
      <p className="text-base font-semibold text-black leading-relaxed">
        {config.message}
      </p>
    </div>
  );
}

function NeedCard({ need }: { need: PlantNeed }) {
  const categoryKey = need.category as unknown as string;
  const config = NEED_CONFIG[categoryKey] ?? {
    emoji: '🌿',
    label: String(need.category),
    goodLabel: 'All Good!',
    attentionLabel: 'Needs Attention!',
    borderColor: 'border-nature-green/50',
    bgColor: 'bg-nature-green/10',
    badgeBg: 'bg-nature-green/20',
    badgeText: 'text-black',
  };

  const isGood = need.status === NeedStatus.good;

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor} shadow-xs transition-transform hover:scale-[1.01]`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border shadow-xs">
            <span className="text-xl" role="img" aria-label={config.label}>
              {config.emoji}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-black">{config.label}</span>
              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.badgeBg} ${config.badgeText} border ${config.borderColor}`}
              >
                {isGood ? '✅' : '⚠️'}
                {isGood ? config.goodLabel : config.attentionLabel}
              </span>
            </div>
            <p className="text-sm font-semibold text-black leading-relaxed">
              {need.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlantResults({ result, imagePreview, onReset }: PlantResultsProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);

  // Count how many needs are good vs need attention
  const goodCount = result.needs.filter((n) => n.status === NeedStatus.good).length;
  const totalCount = result.needs.length;
  const allGood = goodCount === totalCount;
  const mostlyGood = goodCount >= Math.ceil(totalCount / 2);

  const overallEmoji = allGood ? '🎉' : mostlyGood ? '🌿' : '🥀';
  const overallLabel = allGood
    ? 'Your plant is THRIVING!'
    : mostlyGood
    ? 'Your plant needs some love!'
    : 'Your plant needs help!';
  const overallTagline = allGood
    ? 'Everything looks amazing — great job!'
    : mostlyGood
    ? `${goodCount} out of ${totalCount} things are great!`
    : 'Let\'s help your plant feel better!';
  const overallMotivation = allGood
    ? '🌟 WOW! You are an AMAZING plant parent! Your plant is perfectly happy and healthy! Keep up the fantastic work — you are a STAR! ⭐🏆'
    : mostlyGood
    ? '🌿 Your plant is doing pretty well! Just a few things need your attention. You can do it — your plant believes in you! 💪✨'
    : '🥀 Your plant needs a superhero — and that\'s YOU! Check the tips below and give your plant some extra love! 💚🌱';

  const bgClass = allGood
    ? 'from-nature-green/20 to-nature-sage/15'
    : mostlyGood
    ? 'from-nature-mint/20 to-nature-sage/15'
    : 'from-nature-sage/20 to-nature-earth/15';

  const motivationBg = allGood
    ? 'bg-nature-green/15 border-nature-green'
    : mostlyGood
    ? 'bg-nature-mint/15 border-nature-mint'
    : 'bg-nature-sage/15 border-nature-sage';

  useEffect(() => {
    setShowSparkle(true);
    const emojis: FloatingEmoji[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: CELEBRATION_EMOJIS[i % CELEBRATION_EMOJIS.length],
      x: Math.random() * 90 + 5,
      delay: Math.random() * 1.2,
      duration: 2 + Math.random() * 1.5,
      size: 18 + Math.floor(Math.random() * 18),
    }));
    setFloatingEmojis(emojis);

    const timer = setTimeout(() => {
      setFloatingEmojis([]);
      setShowSparkle(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Sort needs by the preferred display order
  const sortedNeeds = [...result.needs].sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a.category as unknown as NeedCategory);
    const bIdx = CATEGORY_ORDER.indexOf(b.category as unknown as NeedCategory);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  // Get emotion string value
  const emotionValue = result.emotion as unknown as string;

  return (
    <div className="space-y-6 animate-float-up relative">
      {/* Celebration floating emojis */}
      {floatingEmojis.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {floatingEmojis.map((item) => (
            <span
              key={item.id}
              className="absolute animate-celebrate-float select-none"
              style={{
                left: `${item.x}%`,
                bottom: '-10%',
                fontSize: `${item.size}px`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              {item.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Sparkle overlay */}
      {showSparkle && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <img
            src="/assets/generated/celebration-sparkle.dim_400x400.png"
            alt=""
            aria-hidden="true"
            className="w-64 h-64 object-contain animate-sparkle-burst opacity-0"
          />
        </div>
      )}

      {/* 🌟 EMOTION SECTION — shown prominently at the top */}
      <EmotionCard emotion={emotionValue} />

      {/* Header: image + tree + overall status */}
      <div className={`rounded-3xl bg-gradient-to-br ${bgClass} p-6 text-center space-y-3 border border-border shadow-candy`}>
        {/* Plant image + tree hero row */}
        <div className="flex justify-center items-end gap-4 mb-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-candy flex-shrink-0">
            <img src={imagePreview} alt="Your plant" className="w-full h-full object-cover" />
          </div>
          <CuteTreeHero />
        </div>

        {/* Big emoji */}
        <div className="text-8xl leading-none animate-emoji-bounce select-none" role="img" aria-label={overallLabel}>
          {overallEmoji}
        </div>

        {/* Status label */}
        <div>
          <h2 className="text-2xl font-bold text-black tracking-wide">
            {overallLabel}
          </h2>
          <p className="text-black font-medium mt-1">{overallTagline}</p>
        </div>

        {/* Score badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-primary/20 shadow-xs">
          <span className="text-lg">🌿</span>
          <span className="text-sm font-bold text-black">
            {goodCount}/{totalCount} checks passed
          </span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className={`rounded-2xl border-2 ${motivationBg} p-4`}>
        <p className="text-base font-bold text-black leading-relaxed text-center">
          {overallMotivation}
        </p>
      </div>

      {/* Plant Needs Detection Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🔍</span>
          <h3 className="text-lg font-bold text-black">Plant Health Check</h3>
          <span className="text-xl">🌿</span>
        </div>

        <div className="space-y-3">
          {sortedNeeds.map((need, index) => (
            <NeedCard key={index} need={need} />
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        onClick={onReset}
        className="w-full h-12 text-base font-bold rounded-2xl shadow-candy hover:shadow-candy-lg transition-all gap-2 active:scale-95"
        size="lg"
      >
        <RefreshCw className="w-5 h-5" />
        Scan Another Plant 🌿
      </Button>
    </div>
  );
}
