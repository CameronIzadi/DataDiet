'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { generateDoctorReport } from '@/services/gemini';
import { markdownToSafeHTML } from '@/lib/sanitize';
import { pdf } from '@react-pdf/renderer';
import { DietaryReportPDF } from '@/components/reports/DietaryReportPDF';
import {
  FileText,
  Loader2,
  Download,
  Printer,
  Sparkles,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  Plus
} from 'lucide-react';
import Link from 'next/link';

type TimePeriod = '1month' | '3month' | '6month' | '1year';

interface SavedReport {
  id: string;
  generatedAt: Date;
  period: TimePeriod;
  periodLabel: string;
  mealsAnalyzed: number;
  content: string;
}

const periodOptions: { value: TimePeriod; label: string; days: number }[] = [
  { value: '1month', label: '1 Month', days: 30 },
  { value: '3month', label: '3 Months', days: 90 },
  { value: '6month', label: '6 Months', days: 180 },
  { value: '1year', label: '1 Year', days: 365 },
];

export default function ReportPage() {
  const { meals, insights, bloodWork, isLoading } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3month');
  const [currentReport, setCurrentReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load saved reports from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedReports');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedReports(parsed.map((r: SavedReport) => ({
          ...r,
          generatedAt: new Date(r.generatedAt)
        })));
      } catch {
        // Invalid stored data
      }
    }
  }, []);

  // Save reports to localStorage
  const saveReportsToStorage = (reports: SavedReport[]) => {
    localStorage.setItem('savedReports', JSON.stringify(reports));
  };

  const getPeriodLabel = (period: TimePeriod) => {
    return periodOptions.find(p => p.value === period)?.label || period;
  };

  const getFilteredMeals = (period: TimePeriod) => {
    const days = periodOptions.find(p => p.value === period)?.days || 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return meals.filter(m => new Date(m.loggedAt) >= cutoff);
  };

  const handleGenerate = async () => {
    const filteredMeals = getFilteredMeals(selectedPeriod);
    if (filteredMeals.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedReport = await generateDoctorReport(
        filteredMeals,
        insights,
        bloodWork || undefined
      );
      setCurrentReport(generatedReport);

      // Save to history
      const newReport: SavedReport = {
        id: `rpt_${Date.now()}`,
        generatedAt: new Date(),
        period: selectedPeriod,
        periodLabel: getPeriodLabel(selectedPeriod),
        mealsAnalyzed: filteredMeals.length,
        content: generatedReport,
      };

      const updatedReports = [newReport, ...savedReports].slice(0, 10); // Keep last 10
      setSavedReports(updatedReports);
      saveReportsToStorage(updatedReports);
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    saveReportsToStorage(updated);
    if (viewingReport?.id === id) {
      setViewingReport(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (reportContent: string, reportDate?: Date, periodLabelOverride?: string, mealsOverride?: number) => {
    setIsDownloading(true);
    try {
      const pdfDoc = (
        <DietaryReportPDF
          insights={insights}
          bloodWork={bloodWork || undefined}
          reportContent={reportContent}
          generatedAt={reportDate || new Date()}
          periodLabel={periodLabelOverride || getPeriodLabel(selectedPeriod)}
          mealsAnalyzed={mealsOverride || getFilteredMeals(selectedPeriod).length}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadiet-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-warm-200 dark:border-neutral-700 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-warm-500 dark:text-neutral-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-warm-400 dark:text-neutral-500" />
          </div>
          <h1 className="text-display text-3xl text-warm-900 dark:text-neutral-100 mb-3">No Data Yet</h1>
          <p className="text-warm-500 dark:text-neutral-400 mb-8 leading-relaxed">
            Start logging your meals to generate comprehensive reports for your healthcare provider.
          </p>
          <Link href="/app" className="btn btn-primary btn-lg">
            Log Your First Meal
          </Link>
        </div>
      </div>
    );
  }

  // Viewing a saved report
  if (viewingReport) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setViewingReport(null)}
            className="flex items-center gap-2 text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Reports
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={() => handleDownload(viewingReport.content, viewingReport.generatedAt, viewingReport.periodLabel, viewingReport.mealsAnalyzed)}
              disabled={isDownloading}
              className="btn btn-primary btn-sm"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div ref={reportRef} className="bg-white dark:bg-neutral-800/50 rounded-3xl border border-warm-200 dark:border-neutral-700 p-8 print:shadow-none print:border-0">
          <div className="mb-8 pb-6 border-b border-warm-200 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-warm-900 dark:text-neutral-100">Dietary Pattern Report</h2>
                <p className="text-sm text-warm-500 dark:text-neutral-400">
                  {viewingReport.generatedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {viewingReport.periodLabel} • {viewingReport.mealsAnalyzed} meals
                </p>
              </div>
            </div>
          </div>

          <div
            className="prose prose-warm dark:prose-invert max-w-none prose-headings:text-warm-800 dark:prose-headings:text-neutral-200 prose-p:text-warm-600 dark:prose-p:text-neutral-400 prose-li:text-warm-600 dark:prose-li:text-neutral-400"
            dangerouslySetInnerHTML={{
              __html: markdownToSafeHTML(viewingReport.content)
            }}
          />

          <div className="mt-10 pt-6 border-t border-warm-200 dark:border-neutral-700 text-xs text-warm-400 dark:text-neutral-500">
            <p className="mb-2">
              This report was generated from patient-logged dietary data and AI pattern analysis.
              It is intended as a reference tool for clinical discussion, not a diagnosis.
            </p>
            <p>
              <strong>Report ID:</strong> {viewingReport.id.toUpperCase()} •
              <strong> Generated by:</strong> DataDiet
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Current report view
  if (currentReport && !showHistory) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-display text-3xl text-warm-900 dark:text-neutral-100 mb-1">Your Report</h1>
            <p className="text-warm-500 dark:text-neutral-400">Generated just now</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentReport(null);
                setShowHistory(false);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="btn btn-secondary btn-sm"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(currentReport!)}
              disabled={isDownloading}
              className="btn btn-primary btn-sm"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div ref={reportRef} className="bg-white dark:bg-neutral-800/50 rounded-3xl border border-warm-200 dark:border-neutral-700 p-8 print:shadow-none print:border-0">
          <div className="mb-8 pb-6 border-b border-warm-200 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-warm-900 dark:text-neutral-100">Dietary Pattern Report</h2>
                <p className="text-sm text-warm-500 dark:text-neutral-400">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {getPeriodLabel(selectedPeriod)} • {getFilteredMeals(selectedPeriod).length} meals
                </p>
              </div>
            </div>
          </div>

          <div
            className="prose prose-warm dark:prose-invert max-w-none prose-headings:text-warm-800 dark:prose-headings:text-neutral-200 prose-p:text-warm-600 dark:prose-p:text-neutral-400 prose-li:text-warm-600 dark:prose-li:text-neutral-400"
            dangerouslySetInnerHTML={{
              __html: markdownToSafeHTML(currentReport)
            }}
          />

          <div className="mt-10 pt-6 border-t border-warm-200 dark:border-neutral-700 text-xs text-warm-400 dark:text-neutral-500">
            <p className="mb-2">
              This report was generated from patient-logged dietary data and AI pattern analysis.
              It is intended as a reference tool for clinical discussion, not a diagnosis.
            </p>
            <p>
              <strong>Report ID:</strong> RPT-{Date.now().toString(36).toUpperCase()} •
              <strong> Generated by:</strong> DataDiet
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main view - generate new report or view history
  const filteredMealsCount = getFilteredMeals(selectedPeriod).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-display text-4xl text-warm-900 dark:text-neutral-100 mb-2">
            Doctor Reports
          </h1>
          <p className="text-warm-500 dark:text-neutral-400 text-lg">
            AI-generated reports for your healthcare provider
          </p>
        </div>
        {savedReports.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`btn ${showHistory ? 'btn-primary' : 'btn-secondary'}`}
          >
            <History className="w-4 h-4" />
            {showHistory ? 'Create New' : `View History (${savedReports.length})`}
          </button>
        )}
      </div>

      {showHistory ? (
        /* History View */
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-warm-800 dark:text-neutral-200">
              Report History
            </h2>
            <p className="text-sm text-warm-500 dark:text-neutral-400">
              {savedReports.length} report{savedReports.length !== 1 ? 's' : ''} saved
            </p>
          </div>

          {savedReports.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-12 h-12 text-warm-300 dark:text-neutral-600 mx-auto mb-4" />
              <p className="text-warm-500 dark:text-neutral-400">No reports generated yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="group p-5 rounded-2xl bg-white dark:bg-neutral-800/50 border border-warm-200 dark:border-neutral-700 hover:border-sage-300 dark:hover:border-sage-700 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-warm-900 dark:text-neutral-100">
                          {report.periodLabel} Report
                        </h3>
                        <p className="text-sm text-warm-500 dark:text-neutral-400">
                          {report.generatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {report.mealsAnalyzed} meals analyzed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(report.content, report.generatedAt, report.periodLabel, report.mealsAnalyzed)}
                        disabled={isDownloading}
                        className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-neutral-700 text-warm-500 dark:text-neutral-400 transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/30 text-warm-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewingReport(report)}
                        className="btn btn-secondary btn-sm ml-2"
                      >
                        View
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Generate New Report View */
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Generation Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800/50 rounded-3xl border border-warm-200 dark:border-neutral-700 p-8">
              {/* Period Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-warm-700 dark:text-neutral-300 mb-3">
                  Select Time Period
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {periodOptions.map((option) => {
                    const mealsInPeriod = getFilteredMeals(option.value).length;
                    const isSelected = selectedPeriod === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedPeriod(option.value)}
                        className={`
                          relative p-4 rounded-xl border-2 text-left transition-all
                          ${isSelected
                            ? 'border-sage-500 bg-sage-50 dark:bg-sage-950/30'
                            : 'border-warm-200 dark:border-neutral-700 hover:border-warm-300 dark:hover:border-neutral-600'
                          }
                        `}
                      >
                        <div className={`font-semibold ${isSelected ? 'text-sage-700 dark:text-sage-300' : 'text-warm-800 dark:text-neutral-200'}`}>
                          {option.label}
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-sage-600 dark:text-sage-400' : 'text-warm-500 dark:text-neutral-400'}`}>
                          {mealsInPeriod} meals
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sage-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Blood Work Status */}
              <div className="mb-8">
                {bloodWork ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="font-medium text-emerald-800 dark:text-emerald-300">Blood work included</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          From {bloodWork.testDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300">No blood work added</p>
                          <p className="text-sm text-amber-600 dark:text-amber-400">Add blood work for more insights</p>
                        </div>
                      </div>
                      <Link href="/app/bloodwork" className="btn btn-secondary btn-sm">
                        Add
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <p className="text-rose-700 dark:text-rose-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || filteredMealsCount === 0}
                className="w-full btn btn-primary btn-lg justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {getPeriodLabel(selectedPeriod)} Report
                  </>
                )}
              </button>

              {filteredMealsCount === 0 && (
                <p className="text-center text-sm text-warm-500 dark:text-neutral-400 mt-4">
                  No meals logged in this time period
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-warm-200 dark:border-neutral-700 p-6">
              <h3 className="font-semibold text-warm-800 dark:text-neutral-200 mb-4">
                {getPeriodLabel(selectedPeriod)} Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-warm-500 dark:text-neutral-400">Meals Logged</span>
                  <span className="font-semibold text-warm-900 dark:text-neutral-100">{filteredMealsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-500 dark:text-neutral-400">Plastic Bottles</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{insights.plastic.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-500 dark:text-neutral-400">Processed Meat</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{insights.processedMeat.perWeek.toFixed(1)}/wk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warm-500 dark:text-neutral-400">Late Meals</span>
                  <span className="font-semibold text-violet-600 dark:text-violet-400">{insights.mealTiming.lateMealPercent}%</span>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            {savedReports.length > 0 && (
              <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-warm-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-warm-800 dark:text-neutral-200">Recent Reports</h3>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-sm text-sage-600 dark:text-sage-400 hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {savedReports.slice(0, 3).map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setViewingReport(report)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-warm-800 dark:text-neutral-200 truncate">
                          {report.periodLabel}
                        </p>
                        <p className="text-xs text-warm-500 dark:text-neutral-400">
                          {report.generatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-warm-400 dark:text-neutral-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-sage-50 to-sage-100 dark:from-sage-950/50 dark:to-sage-900/30 rounded-2xl p-6 border border-sage-200 dark:border-sage-800/50">
              <h3 className="font-semibold text-sage-800 dark:text-sage-300 mb-2">
                About Reports
              </h3>
              <p className="text-sm text-sage-700 dark:text-sage-400 leading-relaxed">
                Reports analyze your meal patterns, flag frequencies, and timing to provide insights for your healthcare provider. They&apos;re generated by AI and should be discussed with your doctor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
          nav, button, .btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
