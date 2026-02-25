import React from 'react';
import { Heart } from 'lucide-react';
import QRCodeCanvas from './QRCodeCanvas';

interface LayoutProps {
  children: React.ReactNode;
}

/** Cute tree character with sparkle/heart accents and gentle animation */
function CuteTree({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = { sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl' };
  const accentSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <span className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Left sparkle */}
      <span
        className={`absolute -top-1 -left-2 ${accentSizeMap[size]} animate-sparkle-twinkle pointer-events-none`}
        style={{ animationDelay: '0s' }}
        aria-hidden="true"
      >
        ✨
      </span>
      {/* Tree */}
      <span className={`${sizeMap[size]} animate-tree-wiggle tree-glow inline-block`} role="img" aria-label="cute tree">
        🌳
      </span>
      {/* Right heart */}
      <span
        className={`absolute -top-1 -right-2 ${accentSizeMap[size]} animate-heart-float pointer-events-none`}
        style={{ animationDelay: '0.6s' }}
        aria-hidden="true"
      >
        💚
      </span>
    </span>
  );
}

export default function Layout({ children }: LayoutProps) {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-app';
  const appId = encodeURIComponent(hostname);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-botanical relative flex flex-col">
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-background/80 pointer-events-none" />

      {/* Decorative floating botanical elements */}
      <div
        className="absolute top-4 left-4 text-5xl opacity-25 pointer-events-none select-none animate-bubble-float"
        style={{ animationDelay: '0s' }}
      >
        🌿
      </div>
      <div
        className="absolute top-6 right-6 text-4xl opacity-20 pointer-events-none select-none animate-bubble-float"
        style={{ animationDelay: '1.2s' }}
      >
        🍃
      </div>
      <div
        className="absolute bottom-24 left-4 text-4xl opacity-20 pointer-events-none select-none animate-bubble-float"
        style={{ animationDelay: '0.6s' }}
      >
        🌱
      </div>
      <div
        className="absolute bottom-24 right-4 text-5xl opacity-20 pointer-events-none select-none animate-bubble-float"
        style={{ animationDelay: '2s' }}
      >
        🌳
      </div>

      {/* Sun icon accent */}
      <div className="absolute top-2 right-1/2 translate-x-1/2 opacity-10 pointer-events-none select-none">
        <img
          src="/assets/generated/sun-icon.dim_128x128.png"
          alt=""
          aria-hidden="true"
          className="w-20 h-20 object-contain animate-star-spin"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-4">
        <div className="max-w-md mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <CuteTree size="md" />
            <h1
              className="text-3xl font-extrabold tracking-wide text-black"
              style={{ fontFamily: 'Fredoka, sans-serif', letterSpacing: '0.02em', fontWeight: 800 }}
            >
              Plant Feelings
            </h1>
            <CuteTree size="md" />
          </div>
          <p className="text-sm font-semibold text-black">
            Discover how your plant is feeling today 🌱
          </p>
          {/* Decorative pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-black">
            <span className="animate-sparkle-twinkle inline-block" style={{ animationDelay: '0.3s' }}>✨</span>
            <span>Magical Plant Scanner</span>
            <span className="animate-sparkle-twinkle inline-block" style={{ animationDelay: '0.9s' }}>✨</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 border-t border-border/50">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          {/* QR Code */}
          {appUrl && (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-xl bg-white border border-primary/20 shadow-sm">
                <QRCodeCanvas
                  value={appUrl}
                  size={112}
                  darkColor="#1a3a1a"
                  lightColor="#ffffff"
                />
              </div>
              <p className="text-xs text-black font-medium">
                Scan to open Plant Feelings
              </p>
            </div>
          )}

          {/* Attribution */}
          <div className="text-center space-y-1">
            <p className="text-xs text-black font-medium">
              © {year} Plant Feelings
            </p>
            <p className="text-xs text-black flex items-center justify-center gap-1">
              Built with{' '}
              <Heart className="w-3 h-3 fill-nature-green text-nature-green inline" />{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-black hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
