'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { analyzeBloodWork, generateCorrelations } from '@/services/insights';
import { BloodWork } from '@/types';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Edit2,
  AlertCircle,
  Upload,
  FileText,
  Keyboard,
  X,
  CheckCircle2,
  Loader2,
  Camera,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// Validation ranges for blood work values
const VALIDATION_RANGES = {
  totalCholesterol: { min: 50, max: 500, label: 'Total Cholesterol' },
  ldl: { min: 20, max: 300, label: 'LDL Cholesterol' },
  hdl: { min: 10, max: 150, label: 'HDL Cholesterol' },
  triglycerides: { min: 20, max: 1000, label: 'Triglycerides' },
  fastingGlucose: { min: 40, max: 400, label: 'Fasting Glucose' },
};

type ValidationErrors = Partial<Record<keyof typeof VALIDATION_RANGES | 'testDate', string>>;
type InputMode = 'select' | 'upload' | 'manual';

export default function BloodWorkPage() {
  const { bloodWork, setBloodWork, insights, meals } = useApp();
  const [inputMode, setInputMode] = useState<InputMode>(bloodWork ? 'select' : 'select');
  const [isEditing, setIsEditing] = useState(!bloodWork);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    testDate: bloodWork?.testDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    totalCholesterol: bloodWork?.totalCholesterol?.toString() || '',
    ldl: bloodWork?.ldl?.toString() || '',
    hdl: bloodWork?.hdl?.toString() || '',
    triglycerides: bloodWork?.triglycerides?.toString() || '',
    fastingGlucose: bloodWork?.fastingGlucose?.toString() || '',
  });

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate test date
    const testDate = new Date(formData.testDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(testDate.getTime())) {
      newErrors.testDate = 'Please enter a valid date';
    } else if (testDate > today) {
      newErrors.testDate = 'Test date cannot be in the future';
    }

    // Validate each blood work value
    for (const [key, range] of Object.entries(VALIDATION_RANGES)) {
      const value = formData[key as keyof typeof formData];
      if (value) {
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          newErrors[key as keyof typeof VALIDATION_RANGES] = 'Please enter a valid number';
        } else if (numValue < range.min || numValue > range.max) {
          newErrors[key as keyof typeof VALIDATION_RANGES] = `Value must be between ${range.min} and ${range.max}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newBloodWork: BloodWork = {
      id: `blood_${Date.now()}`,
      testDate: new Date(formData.testDate),
      totalCholesterol: parseInt(formData.totalCholesterol) || 0,
      ldl: parseInt(formData.ldl) || 0,
      hdl: parseInt(formData.hdl) || 0,
      triglycerides: parseInt(formData.triglycerides) || 0,
      fastingGlucose: parseInt(formData.fastingGlucose) || 0,
    };

    setBloodWork(newBloodWork);
    setIsEditing(false);
    setInputMode('select');
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setUploadState('error');
      return;
    }

    setUploadedFile(file);
    setUploadState('uploading');

    // Simulate upload and processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUploadState('processing');

    // Simulate AI extraction (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo, set some extracted values
    setFormData({
      testDate: new Date().toISOString().split('T')[0],
      totalCholesterol: '195',
      ldl: '110',
      hdl: '55',
      triglycerides: '145',
      fastingGlucose: '92',
    });

    setUploadState('success');
  };

  const ranges = {
    totalCholesterol: { optimal: 200, borderline: 240, unit: 'mg/dL', label: 'Total Cholesterol' },
    ldl: { optimal: 100, borderline: 160, unit: 'mg/dL', label: 'LDL Cholesterol' },
    hdl: { low: 40, optimal: 60, unit: 'mg/dL', label: 'HDL Cholesterol', inverse: true },
    triglycerides: { optimal: 150, borderline: 200, unit: 'mg/dL', label: 'Triglycerides' },
    fastingGlucose: { optimal: 100, borderline: 126, unit: 'mg/dL', label: 'Fasting Glucose' },
  };

  const getStatus = (key: keyof typeof ranges, value: number) => {
    const range = ranges[key];
    if (key === 'hdl') {
      const hdlRange = range as typeof ranges.hdl;
      if (value >= hdlRange.optimal) return { status: 'optimal', label: 'Optimal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' };
      if (value >= hdlRange.low) return { status: 'normal', label: 'Normal', color: 'text-warm-600 dark:text-neutral-400', bg: 'bg-warm-50 dark:bg-neutral-800' };
      return { status: 'low', label: 'Low', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50' };
    }
    const standardRange = range as typeof ranges.totalCholesterol;
    if (value < standardRange.optimal) return { status: 'optimal', label: 'Optimal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' };
    if (value < standardRange.borderline) return { status: 'borderline', label: 'Borderline', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' };
    return { status: 'high', label: 'High', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50' };
  };

  // Selection screen - choose upload or manual
  if (!bloodWork && inputMode === 'select' && isEditing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-display text-3xl sm:text-4xl text-warm-900 dark:text-neutral-100 mb-3">
              Add Blood Work
            </h1>
            <p className="text-warm-500 dark:text-neutral-400 text-lg max-w-md mx-auto">
              Import your lab results to get personalized dietary insights
            </p>
          </div>

          {/* Options */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Upload Option */}
            <button
              onClick={() => setInputMode('upload')}
              className="group relative p-6 rounded-2xl border-2 border-warm-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-warm-900 dark:text-neutral-100 mb-2">
                Upload Lab Report
              </h3>
              <p className="text-sm text-warm-500 dark:text-neutral-400 leading-relaxed">
                Upload a PDF or photo of your lab results and we&apos;ll extract the values automatically
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">PDF</span>
                <span className="px-2 py-1 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">JPG</span>
                <span className="px-2 py-1 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">PNG</span>
              </div>
              <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-warm-300 dark:text-neutral-600 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Manual Option */}
            <button
              onClick={() => setInputMode('manual')}
              className="group relative p-6 rounded-2xl border-2 border-warm-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-sage-400 dark:hover:border-sage-500 hover:shadow-xl hover:shadow-sage-500/10 transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Keyboard className="w-6 h-6 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="font-semibold text-warm-900 dark:text-neutral-100 mb-2">
                Enter Manually
              </h3>
              <p className="text-sm text-warm-500 dark:text-neutral-400 leading-relaxed">
                Type in your blood work values directly from your lab report
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">Cholesterol</span>
                <span className="px-2 py-1 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">Glucose</span>
                <span className="px-2 py-1 rounded-md bg-warm-100 dark:bg-neutral-700 text-xs text-warm-600 dark:text-neutral-400">+3 more</span>
              </div>
              <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-warm-300 dark:text-neutral-600 group-hover:text-sage-500 group-hover:translate-x-1 transition-all" />
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
        <div className="w-full max-w-xl">
          {/* Back button */}
          <button
            onClick={() => {
              setInputMode('select');
              setUploadState('idle');
              setUploadedFile(null);
            }}
            className="flex items-center gap-2 text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-display text-2xl sm:text-3xl text-warm-900 dark:text-neutral-100 mb-2">
              Upload Lab Report
            </h1>
            <p className="text-warm-500 dark:text-neutral-400">
              We&apos;ll extract your blood work values automatically
            </p>
          </div>

          {/* Upload Area */}
          {uploadState === 'idle' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
                ${dragActive
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-warm-300 dark:border-neutral-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/10'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>

              <p className="text-warm-700 dark:text-neutral-300 font-medium mb-2">
                Drag & drop your lab report here
              </p>
              <p className="text-sm text-warm-500 dark:text-neutral-400 mb-6">
                or click to browse files
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </button>

              <p className="text-xs text-warm-400 dark:text-neutral-500 mt-6">
                Supports PDF, JPG, PNG, HEIC
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="border-2 border-violet-200 dark:border-violet-800 rounded-2xl p-12 text-center bg-violet-50/50 dark:bg-violet-950/20">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
              </div>
              <p className="text-warm-700 dark:text-neutral-300 font-medium mb-2">
                {uploadState === 'uploading' ? 'Uploading...' : 'Extracting values...'}
              </p>
              <p className="text-sm text-warm-500 dark:text-neutral-400">
                {uploadedFile?.name}
              </p>
            </div>
          )}

          {/* Upload Success */}
          {uploadState === 'success' && (
            <div className="space-y-6">
              <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Values Extracted</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Please review and confirm</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ranges).map(([key, range]) => (
                    <div key={key} className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-warm-200 dark:border-neutral-700">
                      <p className="text-xs text-warm-500 dark:text-neutral-400 mb-1">{range.label}</p>
                      <p className="font-semibold text-warm-900 dark:text-neutral-100">
                        {formData[key as keyof typeof formData]} <span className="text-warm-400 dark:text-neutral-500 font-normal text-sm">{range.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setInputMode('manual');
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Edit Values
                </button>
                <button
                  onClick={() => {
                    const newBloodWork: BloodWork = {
                      id: `blood_${Date.now()}`,
                      testDate: new Date(formData.testDate),
                      totalCholesterol: parseInt(formData.totalCholesterol) || 0,
                      ldl: parseInt(formData.ldl) || 0,
                      hdl: parseInt(formData.hdl) || 0,
                      triglycerides: parseInt(formData.triglycerides) || 0,
                      fastingGlucose: parseInt(formData.fastingGlucose) || 0,
                    };
                    setBloodWork(newBloodWork);
                    setIsEditing(false);
                    setInputMode('select');
                  }}
                  className="btn btn-primary flex-1"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadState === 'error' && (
            <div className="border-2 border-rose-200 dark:border-rose-800 rounded-2xl p-12 text-center bg-rose-50/50 dark:bg-rose-950/20">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-warm-700 dark:text-neutral-300 font-medium mb-2">
                Upload Failed
              </p>
              <p className="text-sm text-warm-500 dark:text-neutral-400 mb-6">
                Please try again with a PDF or image file
              </p>
              <button
                onClick={() => setUploadState('idle')}
                className="btn btn-secondary"
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
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Back button */}
        {!bloodWork && (
          <button
            onClick={() => setInputMode('select')}
            className="flex items-center gap-2 text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <h1 className="text-display text-2xl sm:text-3xl text-warm-900 dark:text-neutral-100 mb-2">
          {bloodWork ? 'Edit Blood Work' : 'Enter Blood Work'}
        </h1>
        <p className="text-warm-500 dark:text-neutral-400 mb-10">
          Enter your latest test results
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-warm-700 dark:text-neutral-300 mb-2">
              Test Date
            </label>
            <input
              type="date"
              value={formData.testDate}
              onChange={(e) => handleChange('testDate', e.target.value)}
              className={`input ${errors.testDate ? 'border-rose-300 focus:border-rose-500' : ''}`}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {errors.testDate && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.testDate}
              </p>
            )}
          </div>

          {Object.entries(ranges).map(([key, range]) => {
            const error = errors[key as keyof typeof errors];
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-warm-700 dark:text-neutral-300 mb-2">
                  {range.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={`e.g., ${range.optimal}`}
                    className={`input pr-16 ${error ? 'border-rose-300 focus:border-rose-500' : ''}`}
                    min="0"
                    max="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-warm-400 dark:text-neutral-500">
                    {range.unit}
                  </span>
                </div>
                {error ? (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-warm-400 dark:text-neutral-500 mt-1.5">
                    {key === 'hdl'
                      ? `Higher is better - Optimal: >${range.optimal}`
                      : `Lower is better - Optimal: <${range.optimal}`}
                  </p>
                )}
              </div>
            );
          })}

          <div className="flex gap-3 pt-6">
            <button type="submit" className="btn btn-primary flex-1 btn-lg">
              Save Results
            </button>
            {bloodWork && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setInputMode('select');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Results view
  const status = bloodWork ? analyzeBloodWork(bloodWork) : null;
  const correlations = bloodWork && meals.length > 0
    ? generateCorrelations(insights, bloodWork)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-display text-3xl sm:text-4xl text-warm-900 dark:text-neutral-100 mb-2">Blood Work</h1>
          <p className="text-warm-500 dark:text-neutral-400">
            Test from {bloodWork?.testDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setInputMode('manual');
          }}
          className="btn btn-secondary"
        >
          <Edit2 className="w-4 h-4" />
          Edit Results
        </button>
      </div>

      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {bloodWork && Object.entries(ranges).map(([key, range]) => {
          const value = bloodWork[key as keyof BloodWork] as number;
          const statusInfo = getStatus(key as keyof typeof ranges, value);

          return (
            <div key={key} className="p-5 rounded-2xl bg-white dark:bg-neutral-800/50 border border-warm-200 dark:border-neutral-700 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-warm-500 dark:text-neutral-400">{range.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-display text-3xl ${statusInfo.color}`}>
                  {value}
                </span>
                <span className="text-sm text-warm-400 dark:text-neutral-500">{range.unit}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-warm-400 dark:text-neutral-500">
                {key === 'hdl' ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>Higher is better</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span>Optimal &lt;{range.optimal}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dietary Correlations */}
      {correlations.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 mb-10">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Potential Dietary Correlations
          </h3>
          <ul className="space-y-3">
            {correlations.map((correlation, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span className="text-amber-900 dark:text-amber-200">{correlation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reference Note */}
      <div className="p-5 rounded-2xl bg-warm-100 dark:bg-neutral-800 text-sm text-warm-600 dark:text-neutral-400 mb-10">
        <p>
          <strong className="text-warm-700 dark:text-neutral-300">Note:</strong> Reference ranges may vary by lab. These correlations are
          for discussion with your healthcare provider, not diagnoses.
        </p>
      </div>

      {/* CTA to Report */}
      <div className="text-center">
        <Link href="/app/report" className="btn btn-primary btn-lg group">
          Generate Doctor Report
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
