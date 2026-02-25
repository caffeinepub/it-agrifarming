import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6">
      {/* Cute tree with spinning leaves and sparkle accents */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer spinning leaf */}
        <span
          className="absolute text-5xl animate-spin-leaf select-none"
          style={{ animationDuration: '1.4s' }}
          aria-hidden="true"
        >
          🌿
        </span>
        {/* Inner counter-spinning leaf */}
        <span
          className="absolute text-3xl animate-spin-leaf select-none opacity-70"
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          aria-hidden="true"
        >
          🍃
        </span>

        {/* Center cute tree */}
        <span className="relative z-10 text-4xl animate-tree-bounce tree-glow-lg select-none inline-block" role="img" aria-label="cute tree">
          🌳
        </span>

        {/* Sparkle accents — positioned around the tree */}
        <span
          className="absolute top-1 right-3 text-sm animate-sparkle-twinkle select-none pointer-events-none"
          style={{ animationDelay: '0s' }}
          aria-hidden="true"
        >
          ✨
        </span>
        <span
          className="absolute bottom-2 left-3 text-sm animate-sparkle-twinkle select-none pointer-events-none"
          style={{ animationDelay: '0.7s' }}
          aria-hidden="true"
        >
          💚
        </span>
        <span
          className="absolute top-3 left-4 text-xs animate-sparkle-twinkle select-none pointer-events-none"
          style={{ animationDelay: '1.2s' }}
          aria-hidden="true"
        >
          🌸
        </span>
        <span
          className="absolute bottom-3 right-4 text-xs animate-heart-float select-none pointer-events-none"
          style={{ animationDelay: '0.4s' }}
          aria-hidden="true"
        >
          💛
        </span>
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-black">
          Talking to your plant...
        </p>
        <p className="text-sm text-black font-medium">
          🌳 Using nature magic to understand its feelings!
        </p>
      </div>

      {/* Pulsing dots */}
      <div className="flex gap-2 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full bg-primary animate-emoji-pulse"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>

      {/* Fun tip */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-3 max-w-xs text-center">
        <p className="text-xs font-semibold text-black">
          🌳✨ Did you know? Plants can feel happy or sad just like you!
        </p>
      </div>
    </div>
  );
}
