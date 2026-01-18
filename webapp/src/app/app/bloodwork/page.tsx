'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { generateCorrelations } from '@/services/insights';
import { BloodWork, BloodWorkMetric } from '@/types';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Edit2,
  AlertCircle,
  Upload,
  Keyboard,
  X,
  CheckCircle2,
  Loader2,
  Camera,
  ArrowLeft,
  Droplets,
  Heart,
  Zap,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

type InputMode = 'select' | 'upload' | 'manual';

// Helper to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Get status color classes
function getStatusColors(status?: string) {
  switch (status) {
    case 'low':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      };
    case 'high':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
      };
    case 'borderline':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      };
    default:
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      };
  }
}

// Group metrics by category
function categorizeMetrics(metrics: Record<string, BloodWorkMetric>) {
  const categories: Record<string, { name: string; metrics: Array<{ key: string; metric: BloodWorkMetric }> }> = {
    lipid: { name: 'Lipid Panel', metrics: [] },
    glucose: { name: 'Blood Sugar', metrics: [] },
    cbc: { name: 'Complete Blood Count', metrics: [] },
    metabolic: { name: 'Metabolic Panel', metrics: [] },
    liver: { name: 'Liver Function', metrics: [] },
    thyroid: { name: 'Thyroid', metrics: [] },
    iron: { name: 'Iron Studies', metrics: [] },
    vitamins: { name: 'Vitamins', metrics: [] },
    other: { name: 'Other Tests', metrics: [] },
  };

  const categoryKeywords: Record<string, string[]> = {
    lipid: ['cholesterol', 'ldl', 'hdl', 'triglyceride', 'vldl', 'non-hdl'],
    glucose: ['glucose', 'hba1c', 'a1c', 'blood sugar', 'fasting'],
    cbc: ['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelet', 'mcv', 'mch', 'mchc', 'rdw', 'white blood', 'red blood'],
    metabolic: ['sodium', 'potassium', 'chloride', 'co2', 'bun', 'creatinine', 'calcium', 'gfr', 'egfr'],
    liver: ['alt', 'ast', 'alp', 'bilirubin', 'albumin', 'total protein', 'ggt', 'alkaline'],
    thyroid: ['tsh', 't3', 't4', 'thyroid'],
    iron: ['iron', 'ferritin', 'tibc', 'transferrin'],
    vitamins: ['vitamin', 'folate', 'b12', 'b-12'],
  };

  Object.entries(metrics).forEach(([key, metric]) => {
    const lowerKey = key.toLowerCase();
    let categorized = false;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lowerKey.includes(kw))) {
        categories[category].metrics.push({ key, metric });
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      categories.other.metrics.push({ key, metric });
    }
  });

  // Filter out empty categories
  return Object.entries(categories)
    .filter(([, cat]) => cat.metrics.length > 0)
    .map(([id, cat]) => ({ id, ...cat }));
}

export default function BloodWorkPage() {
  const { bloodWork, bloodWorkHistory, addBloodWork, deleteBloodWork, insights, meals } = useApp();
  const [inputMode, setInputMode] = useState<InputMode>(bloodWorkHistory.length > 0 ? 'select' : 'select');
  const [isEditing, setIsEditing] = useState(bloodWorkHistory.length === 0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<{ testDate?: string; metrics: Record<string, BloodWorkMetric> } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedBloodWork, setSelectedBloodWork] = useState<BloodWork | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual form data (for backward compatibility)
  const [formData, setFormData] = useState({
    testDate: new Date().toISOString().split('T')[0],
    totalCholesterol: '',
    ldl: '',
    hdl: '',
    triglycerides: '',
    fastingGlucose: '',
  });

  // Set selected blood work to most recent on mount
  const viewingBloodWork = selectedBloodWork || bloodWork;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or image file (JPEG, PNG, WebP)');
      setUploadState('error');
      return;
    }

    setUploadedFile(file);
    setUploadError(null);
    setUploadState('uploading');

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      setUploadState('processing');

      // Call the API to extract blood work values
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extractBloodWork',
          data: {
            base64Image: base64,
            mimeType: file.type,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to extract blood work data');
      }

      // Store the extracted data
      setExtractedData({
        testDate: result.result.testDate,
        metrics: result.result.metrics || {},
      });

      setUploadState('success');
    } catch (error) {
      console.error('Blood work extraction error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to process file');
      setUploadState('error');
    }
  };

  const saveExtractedData = async () => {
    if (!extractedData) return;

    // Extract core values if available
    const findMetric = (keywords: string[]) => {
      for (const [key, metric] of Object.entries(extractedData.metrics)) {
        const lowerKey = key.toLowerCase();
        if (keywords.some(kw => lowerKey.includes(kw))) {
          return metric.value;
        }
      }
      return undefined;
    };

    const newBloodWork: BloodWork = {
      id: `blood_${Date.now()}`,
      testDate: extractedData.testDate ? new Date(extractedData.testDate) : new Date(),
      totalCholesterol: findMetric(['total cholesterol']),
      ldl: findMetric(['ldl']),
      hdl: findMetric(['hdl']),
      triglycerides: findMetric(['triglyceride']),
      fastingGlucose: findMetric(['glucose', 'fasting']),
      hba1c: findMetric(['hba1c', 'a1c']),
      metrics: extractedData.metrics,
      sourceFileName: uploadedFile?.name,
    };

    await addBloodWork(newBloodWork);
    setIsEditing(false);
    setInputMode('select');
    setExtractedData(null);
    setUploadedFile(null);
    setUploadState('idle');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newBloodWork: BloodWork = {
      id: `blood_${Date.now()}`,
      testDate: new Date(formData.testDate),
      totalCholesterol: parseInt(formData.totalCholesterol) || undefined,
      ldl: parseInt(formData.ldl) || undefined,
      hdl: parseInt(formData.hdl) || undefined,
      triglycerides: parseInt(formData.triglycerides) || undefined,
      fastingGlucose: parseInt(formData.fastingGlucose) || undefined,
    };

    await addBloodWork(newBloodWork);
    setIsEditing(false);
    setInputMode('select');
    // Reset form
    setFormData({
      testDate: new Date().toISOString().split('T')[0],
      totalCholesterol: '',
      ldl: '',
      hdl: '',
      triglycerides: '',
      fastingGlucose: '',
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Selection screen (no history)
  if (bloodWorkHistory.length === 0 && inputMode === 'select' && isEditing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-5">
              <Droplets className="w-8 h-8 text-sage-600 dark:text-sage-400" />
            </div>
            <h1 className="text-display text-3xl text-warm-900 dark:text-neutral-100 mb-2">
              Blood Work Analysis
            </h1>
            <p className="text-warm-500 dark:text-neutral-400">
              Import your lab results for personalized insights
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode('upload')}
              className="group p-6 rounded-2xl border border-warm-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-sage-300 dark:hover:border-sage-700 hover:bg-sage-50/50 dark:hover:bg-sage-900/10 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-4 group-hover:bg-sage-200 dark:group-hover:bg-sage-900/50 transition-colors">
                <Upload className="w-6 h-6 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="text-lg font-semibold text-warm-900 dark:text-neutral-100 mb-1">
                Upload Report
              </h3>
              <p className="text-sm text-warm-500 dark:text-neutral-400 mb-3">
                AI extracts all values automatically
              </p>
              <div className="flex gap-2">
                {['PDF', 'JPG', 'PNG'].map(format => (
                  <span key={format} className="px-2 py-0.5 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">
                    {format}
                  </span>
                ))}
              </div>
            </button>

            <button
              onClick={() => setInputMode('manual')}
              className="group p-6 rounded-2xl border border-warm-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-sage-300 dark:hover:border-sage-700 hover:bg-sage-50/50 dark:hover:bg-sage-900/10 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-4 group-hover:bg-sage-200 dark:group-hover:bg-sage-900/50 transition-colors">
                <Keyboard className="w-6 h-6 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="text-lg font-semibold text-warm-900 dark:text-neutral-100 mb-1">
                Enter Manually
              </h3>
              <p className="text-sm text-warm-500 dark:text-neutral-400 mb-3">
                Type core values from your report
              </p>
              <div className="flex gap-2">
                {['Cholesterol', 'Glucose'].map(item => (
                  <span key={item} className="px-2 py-0.5 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">
                    {item}
                  </span>
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload view
  if (inputMode === 'upload' && isEditing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => {
              setInputMode('select');
              setUploadState('idle');
              setUploadedFile(null);
              setExtractedData(null);
              setUploadError(null);
            }}
            className="flex items-center gap-2 text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-display text-2xl text-warm-900 dark:text-neutral-100 mb-2">
              Upload Lab Report
            </h1>
            <p className="text-warm-500 dark:text-neutral-400">
              AI will extract all blood work values
            </p>
          </div>

          {uploadState === 'idle' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-10 text-center transition-all
                ${dragActive
                  ? 'border-sage-500 bg-sage-50 dark:bg-sage-950/20'
                  : 'border-warm-300 dark:border-neutral-600 hover:border-sage-400 dark:hover:border-sage-600'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-7 h-7 text-sage-600 dark:text-sage-400" />
              </div>

              <p className="text-warm-800 dark:text-neutral-200 font-medium mb-1">
                Drop your lab report here
              </p>
              <p className="text-warm-500 dark:text-neutral-400 text-sm mb-5">
                PDF or image (JPEG, PNG, WebP)
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </button>
            </div>
          )}

          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="border border-sage-200 dark:border-sage-800 rounded-2xl p-10 text-center bg-sage-50/50 dark:bg-sage-950/20">
              <div className="w-14 h-14 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-sage-600 dark:text-sage-400 animate-spin" />
              </div>
              <p className="text-warm-800 dark:text-neutral-200 font-medium mb-1">
                {uploadState === 'uploading' ? 'Uploading...' : 'Extracting values with AI...'}
              </p>
              <p className="text-warm-500 dark:text-neutral-400 text-sm">
                {uploadedFile?.name}
              </p>
            </div>
          )}

          {uploadState === 'success' && extractedData && (
            <div className="space-y-5">
              <div className="border border-emerald-200 dark:border-emerald-800 rounded-2xl overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3 p-5 border-b border-emerald-200 dark:border-emerald-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">
                      {Object.keys(extractedData.metrics).length} values extracted
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {uploadedFile?.name}
                    </p>
                  </div>
                </div>

                {/* Extracted metrics by category */}
                <div className="divide-y divide-emerald-200 dark:divide-emerald-800">
                  {categorizeMetrics(extractedData.metrics).map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        <span className="font-medium text-warm-800 dark:text-neutral-200">
                          {category.name}
                          <span className="ml-2 text-sm text-warm-500 dark:text-neutral-400">
                            ({category.metrics.length})
                          </span>
                        </span>
                        {expandedCategories[category.id] ? (
                          <ChevronUp className="w-4 h-4 text-warm-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-warm-400" />
                        )}
                      </button>

                      {expandedCategories[category.id] && (
                        <div className="px-4 pb-4 space-y-2">
                          {category.metrics.map(({ key, metric }) => {
                            const colors = getStatusColors(metric.status);
                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-800 border border-warm-100 dark:border-neutral-700"
                              >
                                <div>
                                  <p className="text-sm font-medium text-warm-800 dark:text-neutral-200">{key}</p>
                                  {metric.referenceRange && (
                                    <p className="text-xs text-warm-400 dark:text-neutral-500">
                                      Ref: {metric.referenceRange}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <span className="font-semibold text-warm-900 dark:text-neutral-100">
                                    {metric.value}
                                    <span className="text-warm-400 dark:text-neutral-500 font-normal text-sm ml-1">
                                      {metric.unit}
                                    </span>
                                  </span>
                                  {metric.status && metric.status !== 'normal' && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                                      {metric.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setUploadState('idle');
                    setExtractedData(null);
                    setUploadedFile(null);
                  }}
                  className="flex-1 px-5 py-3 border border-warm-300 dark:border-neutral-600 text-warm-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-warm-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Upload Different File
                </button>
                <button
                  onClick={() => saveExtractedData()}
                  className="flex-1 px-5 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors"
                >
                  Save Results
                </button>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="border border-rose-200 dark:border-rose-800 rounded-2xl p-10 text-center bg-rose-50/50 dark:bg-rose-950/20">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                <X className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-warm-800 dark:text-neutral-200 font-medium mb-1">
                Extraction Failed
              </p>
              <p className="text-warm-500 dark:text-neutral-400 text-sm mb-5">
                {uploadError || 'Please try a different file'}
              </p>
              <button
                onClick={() => {
                  setUploadState('idle');
                  setUploadError(null);
                }}
                className="px-5 py-2.5 border border-warm-300 dark:border-neutral-600 text-warm-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-warm-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Manual form view
  if (inputMode === 'manual' && isEditing) {
    const ranges = {
      totalCholesterol: { optimal: 200, unit: 'mg/dL', label: 'Total Cholesterol' },
      ldl: { optimal: 100, unit: 'mg/dL', label: 'LDL Cholesterol' },
      hdl: { optimal: 60, unit: 'mg/dL', label: 'HDL Cholesterol' },
      triglycerides: { optimal: 150, unit: 'mg/dL', label: 'Triglycerides' },
      fastingGlucose: { optimal: 100, unit: 'mg/dL', label: 'Fasting Glucose' },
    };

    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        {!bloodWork && (
          <button
            onClick={() => setInputMode('select')}
            className="flex items-center gap-2 text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div>
          <h1 className="text-display text-2xl text-warm-900 dark:text-neutral-100 mb-2">
            {bloodWork ? 'Edit Blood Work' : 'Enter Blood Work'}
          </h1>
          <p className="text-warm-500 dark:text-neutral-400 mb-8">
            Enter your core lab values
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-neutral-300 mb-1.5">
                Test Date
              </label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => setFormData(prev => ({ ...prev, testDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-warm-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sage-500"
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {Object.entries(ranges).map(([key, range]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-warm-700 dark:text-neutral-300 mb-1.5">
                  {range.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`e.g., ${range.optimal}`}
                    className="w-full px-4 py-3 pr-16 rounded-xl border border-warm-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-warm-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    min="0"
                    max="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-warm-400 dark:text-neutral-500">
                    {range.unit}
                  </span>
                </div>
                <p className="text-xs text-warm-400 dark:text-neutral-500 mt-1">
                  {key === 'hdl' ? `Higher is better · Optimal: >${range.optimal}` : `Lower is better · Optimal: <${range.optimal}`}
                </p>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl transition-colors"
              >
                Save Results
              </button>
              {bloodWork && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setInputMode('select');
                  }}
                  className="px-5 py-3 border border-warm-300 dark:border-neutral-600 text-warm-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-warm-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-warm-400 dark:text-neutral-500 mt-6">
            For more values,{' '}
            <button
              onClick={() => setInputMode('upload')}
              className="text-sage-600 dark:text-sage-400 hover:underline"
            >
              upload your report
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Results view
  const correlations = viewingBloodWork && meals.length > 0
    ? generateCorrelations(insights, viewingBloodWork)
    : [];

  const hasMetrics = viewingBloodWork?.metrics && Object.keys(viewingBloodWork.metrics).length > 0;
  const categorizedMetrics = hasMetrics ? categorizeMetrics(viewingBloodWork.metrics!) : [];

  // Sort history by date (newest first)
  const sortedHistory = [...bloodWorkHistory].sort((a, b) =>
    new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
  );

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sage-50/50 via-transparent to-transparent dark:from-sage-950/30 dark:via-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-display text-3xl sm:text-4xl text-warm-900 dark:text-neutral-100 mb-1">
                Blood Work
              </h1>
              <p className="text-warm-500 dark:text-neutral-400">
                {viewingBloodWork?.testDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {viewingBloodWork?.sourceFileName && (
                  <span className="ml-2 text-sage-600 dark:text-sage-400">
                    · {viewingBloodWork.sourceFileName}
                  </span>
                )}
                {viewingBloodWork?.id === bloodWork?.id && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 rounded-full">
                    Most Recent
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setInputMode('upload');
                  setUploadState('idle');
                  setExtractedData(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors"
              >
                <Upload className="w-4 h-4" />
                New Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* History Selector */}
        {sortedHistory.length > 1 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-3">Test History</h2>
            <div className="flex flex-wrap gap-2">
              {sortedHistory.map((bw) => {
                const isSelected = viewingBloodWork?.id === bw.id;
                const isMostRecent = bw.id === bloodWork?.id;
                return (
                  <button
                    key={bw.id}
                    onClick={() => setSelectedBloodWork(bw)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-sage-600 text-white'
                        : 'bg-white dark:bg-neutral-800 border border-warm-200 dark:border-neutral-700 text-warm-700 dark:text-neutral-300 hover:border-sage-300 dark:hover:border-sage-600'
                    }`}
                  >
                    {new Date(bw.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isMostRecent && !isSelected && (
                      <span className="ml-1.5 text-xs opacity-60">(Latest)</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-warm-400 dark:text-neutral-500 mt-2">
              AI Chat uses the most recent blood work for analysis
            </p>
          </div>
        )}

        {/* Display all extracted metrics by category */}
        {hasMetrics && (
          <div className="space-y-6 mb-8">
            {categorizedMetrics.map((category) => (
              <div key={category.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-200 dark:border-neutral-800 shadow-sm dark:shadow-none overflow-hidden">
                <div className="px-5 py-4 border-b border-warm-200 dark:border-neutral-800 bg-warm-50/50 dark:bg-neutral-800/30">
                  <h2 className="font-semibold text-warm-900 dark:text-white">{category.name}</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                  {category.metrics.map(({ key, metric }) => {
                    const colors = getStatusColors(metric.status);
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-xl bg-warm-50 dark:bg-neutral-800/50 border border-warm-200 dark:border-neutral-700/50 shadow-sm dark:shadow-none"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-warm-700 dark:text-neutral-400">{key}</p>
                          {metric.status && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                              {metric.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold text-warm-900 dark:text-neutral-100">
                            {metric.value}
                          </span>
                          <span className="text-sm text-warm-500 dark:text-neutral-500">{metric.unit}</span>
                        </div>
                        {metric.referenceRange && (
                          <p className="text-xs text-warm-500 dark:text-neutral-500 mt-1">
                            Ref: {metric.referenceRange}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback: Show core values if no metrics object */}
        {!hasMetrics && viewingBloodWork && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { key: 'totalCholesterol', label: 'Total Cholesterol', value: viewingBloodWork.totalCholesterol },
              { key: 'ldl', label: 'LDL Cholesterol', value: viewingBloodWork.ldl },
              { key: 'hdl', label: 'HDL Cholesterol', value: viewingBloodWork.hdl },
              { key: 'triglycerides', label: 'Triglycerides', value: viewingBloodWork.triglycerides },
              { key: 'fastingGlucose', label: 'Fasting Glucose', value: viewingBloodWork.fastingGlucose },
              { key: 'hba1c', label: 'HbA1c', value: viewingBloodWork.hba1c },
            ].filter(item => item.value !== undefined).map((item) => (
              <div
                key={item.key}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-800/50 border border-warm-200 dark:border-neutral-700/50 shadow-sm dark:shadow-none"
              >
                <p className="text-sm font-medium text-warm-600 dark:text-neutral-400 mb-1">{item.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-display text-3xl text-warm-900 dark:text-neutral-100">{item.value}</span>
                  <span className="text-sm text-warm-500 dark:text-neutral-500">mg/dL</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Correlations */}
        {correlations.length > 0 && (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 mb-8">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Dietary Correlations
            </h3>
            <ul className="space-y-2">
              {correlations.map((correlation, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span className="text-amber-800 dark:text-amber-200">{correlation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reference Note */}
        <div className="p-4 rounded-xl bg-warm-50 dark:bg-neutral-800/50 text-sm text-warm-600 dark:text-neutral-400 mb-8 border border-warm-200 dark:border-neutral-700/50 shadow-sm dark:shadow-none">
          <strong className="text-warm-700 dark:text-neutral-300">Note:</strong> Reference ranges vary by lab.
          Discuss these results with your healthcare provider.
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/app/report"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl transition-colors group"
          >
            Generate Doctor Report
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
