'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { analyzeBloodWork, generateCorrelations } from '@/services/insights';
import { BloodWork } from '@/types';
import { AlertTriangle, TrendingUp, TrendingDown, ArrowRight, Edit2, AlertCircle } from 'lucide-react';
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

export default function BloodWorkPage() {
  const { bloodWork, setBloodWork, insights, meals } = useApp();
  const [isEditing, setIsEditing] = useState(!bloodWork);
  const [errors, setErrors] = useState<ValidationErrors>({});

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
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      if (value >= hdlRange.optimal) return { status: 'optimal', label: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
      if (value >= hdlRange.low) return { status: 'normal', label: 'Normal', color: 'text-warm-600', bg: 'bg-warm-50' };
      return { status: 'low', label: 'Low', color: 'text-rose-600', bg: 'bg-rose-50' };
    }
    const standardRange = range as typeof ranges.totalCholesterol;
    if (value < standardRange.optimal) return { status: 'optimal', label: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (value < standardRange.borderline) return { status: 'borderline', label: 'Borderline', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { status: 'high', label: 'High', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  // Form view
  if (isEditing) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-display text-3xl text-warm-900 mb-2">Blood Work</h1>
        <p className="text-warm-500 mb-10">Enter your latest test results</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
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
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.testDate}
              </p>
            )}
          </div>

          {Object.entries(ranges).map(([key, range]) => {
            const error = errors[key as keyof typeof errors];
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-warm-700 mb-2">
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
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-warm-400">
                    {range.unit}
                  </span>
                </div>
                {error ? (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-warm-400 mt-1.5">
                    {key === 'hdl'
                      ? `Higher is better • Optimal: >${range.optimal}`
                      : `Lower is better • Optimal: <${range.optimal}`}
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
                onClick={() => setIsEditing(false)}
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-display text-3xl text-warm-900 mb-2">Blood Work</h1>
          <p className="text-warm-500">
            Test from {bloodWork?.testDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="btn btn-secondary"
        >
          <Edit2 className="w-4 h-4" />
          Edit Results
        </button>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {bloodWork && Object.entries(ranges).map(([key, range]) => {
          const value = bloodWork[key as keyof BloodWork] as number;
          const statusInfo = getStatus(key as keyof typeof ranges, value);
          
          return (
            <div key={key} className="card-elevated">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-warm-500">{range.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-display text-3xl ${statusInfo.color}`}>
                  {value}
                </span>
                <span className="text-sm text-warm-400">{range.unit}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-warm-400">
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
        <div className="card-elevated bg-amber-50 border-amber-100 mb-10">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Potential Dietary Correlations
          </h3>
          <ul className="space-y-3">
            {correlations.map((correlation, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span className="text-amber-900">{correlation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reference Note */}
      <div className="p-5 bg-warm-100 rounded-2xl text-sm text-warm-600 mb-10">
        <p>
          <strong>Note:</strong> Reference ranges may vary by lab. These correlations are 
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

