'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { analyzeFoodImage, analyzeFoodText } from '@/services/gemini';
import { Camera, Upload, Check, Loader2, X, Edit3, Image as ImageIcon } from 'lucide-react';

export default function CapturePage() {
  const { addMeal } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<'select' | 'preview' | 'analyzing' | 'success' | 'text'>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setMode('preview');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setMode('analyzing');
    setError(null);
    
    try {
      const base64Data = selectedImage.split(',')[1];
      const analysis = await analyzeFoodImage(base64Data);
      
      const now = new Date();
      const hour = now.getHours();
      const isLate = hour >= 21 || hour < 5;
      
      const flags = [...analysis.flags];
      if (isLate && !flags.includes('late_meal')) {
        flags.push('late_meal');
      }
      
      addMeal({
        foods: analysis.foods,
        flags: flags,
        loggedAt: now,
        nutrition: analysis.estimated_nutrition,
        imageUrl: selectedImage
      });
      
      setMode('success');
      
      setTimeout(() => {
        router.push('/app');
      }, 1500);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again or describe your meal instead.');
      setMode('preview');
    }
  };

  const handleTextSubmit = async () => {
    if (!textDescription.trim()) return;
    
    setMode('analyzing');
    setError(null);
    
    try {
      const analysis = await analyzeFoodText(textDescription);
      
      const now = new Date();
      const hour = now.getHours();
      const isLate = hour >= 21 || hour < 5;
      
      const flags = [...analysis.flags];
      if (isLate && !flags.includes('late_meal')) {
        flags.push('late_meal');
      }
      
      addMeal({
        foods: analysis.foods,
        flags: flags,
        loggedAt: now,
        nutrition: analysis.estimated_nutrition
      });
      
      setMode('success');
      
      setTimeout(() => {
        router.push('/app');
      }, 1500);
      
    } catch (err) {
      console.error('Text analysis error:', err);
      setError('Failed to analyze meal description. Please try again.');
      setMode('text');
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setTextDescription('');
    setError(null);
    setMode('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Success state
  if (mode === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-sage-200">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-display text-3xl text-warm-900 mb-2">Meal Logged</h1>
          <p className="text-warm-500">No calories. No judgment. Just data.</p>
        </div>
      </div>
    );
  }

  // Analyzing state
  if (mode === 'analyzing') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-warm-100 to-warm-200 flex items-center justify-center mx-auto mb-8">
            <Loader2 className="w-10 h-10 text-warm-600 animate-spin" />
          </div>
          <h1 className="text-display text-2xl text-warm-900 mb-2">Analyzing your meal...</h1>
          <p className="text-warm-500">AI is identifying foods and patterns</p>
        </div>
      </div>
    );
  }

  // Preview state
  if (mode === 'preview' && selectedImage) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={reset}
          className="flex items-center gap-2 text-warm-500 hover:text-warm-700 mb-6 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        
        <div className="card-elevated p-0 overflow-hidden mb-6">
          <img
            src={selectedImage}
            alt="Meal preview"
            className="w-full h-72 object-cover"
          />
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleAnalyze}
            className="btn btn-primary w-full btn-lg"
          >
            <Check className="w-5 h-5" />
            Log This Meal
          </button>
          
          <button
            onClick={reset}
            className="btn btn-secondary w-full"
          >
            Choose Different Photo
          </button>
        </div>
      </div>
    );
  }

  // Text input mode
  if (mode === 'text') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={reset}
          className="flex items-center gap-2 text-warm-500 hover:text-warm-700 mb-6 transition-colors"
        >
          <X className="w-4 h-4" />
          Back
        </button>
        
        <h1 className="text-display text-2xl text-warm-900 mb-2">Describe Your Meal</h1>
        <p className="text-warm-500 mb-8">What did you eat?</p>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}
        
        <textarea
          value={textDescription}
          onChange={(e) => setTextDescription(e.target.value)}
          placeholder="e.g., 2 scrambled eggs, toast with butter, orange juice in a plastic bottle"
          className="input min-h-[150px] resize-none mb-6"
          autoFocus
        />
        
        <button
          onClick={handleTextSubmit}
          disabled={!textDescription.trim()}
          className="btn btn-primary w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log Meal
        </button>
      </div>
    );
  }

  // Selection state
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-display text-3xl text-warm-900 mb-2">Log a Meal</h1>
      <p className="text-warm-500 mb-10">Capture what you&apos;re eating</p>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        {/* Camera option */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="card-elevated w-full text-left group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white shadow-lg shadow-sage-200 group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-warm-900 text-lg">Take Photo</h3>
              <p className="text-sm text-warm-500">Use camera to capture your meal</p>
            </div>
          </div>
        </button>
        
        {/* Upload option */}
        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }
          }}
          className="card-elevated w-full text-left group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white shadow-lg shadow-warm-200 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-warm-900 text-lg">Upload Image</h3>
              <p className="text-sm text-warm-500">Select from your photo library</p>
            </div>
          </div>
        </button>
        
        {/* Text option */}
        <button
          onClick={() => setMode('text')}
          className="card-elevated w-full text-left group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform">
              <Edit3 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-warm-900 text-lg">Describe Meal</h3>
              <p className="text-sm text-warm-500">Type what you ate</p>
            </div>
          </div>
        </button>
      </div>
      
      <p className="text-center text-sm text-warm-400 mt-10">
        No calories shown. Just capture and forget.
      </p>
    </div>
  );
}

