import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Leaf, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Plant } from '../backend';
import { useAssessPlant } from '../hooks/useQueries';
import PlantResults from '../components/PlantResults';
import LoadingSpinner from '../components/LoadingSpinner';

type ViewState = 'upload' | 'loading' | 'results';

/** Cute mascot tree with sparkle/heart accents for the upload zone */
function CuteMascotTree() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28 select-none">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full animate-glow-pulse" />

      {/* Sparkle top-right */}
      <span
        className="absolute top-0 right-1 text-base animate-sparkle-twinkle pointer-events-none"
        style={{ animationDelay: '0s' }}
        aria-hidden="true"
      >
        ✨
      </span>
      {/* Heart top-left */}
      <span
        className="absolute top-0 left-1 text-base animate-heart-float pointer-events-none"
        style={{ animationDelay: '0.8s' }}
        aria-hidden="true"
      >
        💚
      </span>
      {/* Flower bottom-right */}
      <span
        className="absolute bottom-1 right-2 text-sm animate-sparkle-twinkle pointer-events-none"
        style={{ animationDelay: '1.4s' }}
        aria-hidden="true"
      >
        🌸
      </span>
      {/* Star bottom-left */}
      <span
        className="absolute bottom-1 left-2 text-sm animate-sparkle-twinkle pointer-events-none"
        style={{ animationDelay: '0.5s' }}
        aria-hidden="true"
      >
        ⭐
      </span>

      {/* Tree */}
      <span
        className="text-7xl animate-tree-bounce tree-glow-lg inline-block"
        role="img"
        aria-label="Cute willow tree mascot"
      >
        🌳
      </span>
    </div>
  );
}

export default function PlantScanner() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Plant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const assessPlant = useAssessPlant();

  const handleFileSelected = useCallback((file: File) => {
    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setError(null);
    setViewState('loading');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const imageBytes = new Uint8Array(arrayBuffer);
      const plant = await assessPlant.mutateAsync({
        imageBytes,
        name: selectedFile.name.replace(/\.[^/.]+$/, '') || 'My Plant',
      });
      setResult(plant);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setViewState('upload');
    }
  };

  const handleReset = () => {
    setViewState('upload');
    setImagePreview(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadChange}
        aria-label="Upload plant image"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraChange}
        aria-label="Take plant photo"
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-semibold">{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload State */}
      {viewState === 'upload' && (
        <div className="space-y-5 animate-float-up">
          {/* Drop zone / Preview area */}
          <div
            className={`relative rounded-3xl border-2 border-dashed transition-all overflow-hidden cursor-pointer
              ${imagePreview
                ? 'border-primary bg-primary/8'
                : 'border-border bg-card hover:border-primary hover:bg-primary/5'
              }`}
            onClick={() => uploadInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && uploadInputRef.current?.click()}
            aria-label="Click to upload plant image"
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected plant"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-card/90 rounded-2xl px-4 py-2 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-black">Change photo</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
                {/* Cute willow tree mascot */}
                <CuteMascotTree />
                <div className="text-center space-y-1">
                  <p className="text-base font-bold text-black">Drop your plant photo here! 📸</p>
                  <p className="text-sm text-black font-medium">Tap to pick any photo — big or small!</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-black">
                  <Leaf className="w-3.5 h-3.5 text-nature-green" />
                  <span>JPG, PNG, WEBP — all sizes welcome! 🌿</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-2xl font-bold border-2 gap-2 hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
              onClick={() => uploadInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-2xl font-bold border-2 gap-2 hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>

          {/* Analyze button */}
          <Button
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-candy hover:shadow-candy-lg transition-all gap-2 disabled:opacity-50 active:scale-95"
            onClick={handleAnalyze}
            disabled={!selectedFile || assessPlant.isPending}
          >
            <span className="text-xl animate-tree-wiggle inline-block">🌳</span>
            Analyze My Plant!
          </Button>

          {!selectedFile && (
            <p className="text-center text-xs text-black font-medium">
              📸 Upload or take a photo of your plant to get started
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {viewState === 'loading' && (
        <div className="glass-card rounded-3xl border border-primary/20 shadow-candy p-6">
          <LoadingSpinner />
        </div>
      )}

      {/* Results State */}
      {viewState === 'results' && result && imagePreview && (
        <PlantResults
          result={result}
          imagePreview={imagePreview}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
