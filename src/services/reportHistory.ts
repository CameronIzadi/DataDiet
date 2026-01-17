import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORT_HISTORY_KEY = 'report_history_v1';
const REPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

export interface SavedReport {
  id: string;
  report: string;
  period: string;
  periodLabel: string;
  periodDays: number;
  mealCount: number;
  createdAt: number;
  expiresAt: number;
}

/**
 * Get all saved reports (filtering out expired ones)
 */
export async function getSavedReports(): Promise<SavedReport[]> {
  try {
    const data = await AsyncStorage.getItem(REPORT_HISTORY_KEY);
    if (!data) return [];

    const reports: SavedReport[] = JSON.parse(data);
    const now = Date.now();

    // Filter out expired reports
    const validReports = reports.filter(r => r.expiresAt > now);

    // If we removed any expired reports, save the cleaned list
    if (validReports.length !== reports.length) {
      await AsyncStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(validReports));
    }

    // Sort by newest first
    return validReports.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting saved reports:', error);
    return [];
  }
}

/**
 * Save a new report to history
 */
export async function saveReport(
  report: string,
  period: string,
  periodLabel: string,
  periodDays: number,
  mealCount: number
): Promise<SavedReport> {
  try {
    const existingReports = await getSavedReports();
    const now = Date.now();

    const newReport: SavedReport = {
      id: `report_${now}_${Math.random().toString(36).substring(2, 9)}`,
      report,
      period,
      periodLabel,
      periodDays,
      mealCount,
      createdAt: now,
      expiresAt: now + REPORT_TTL_MS,
    };

    // Add new report to the beginning
    const updatedReports = [newReport, ...existingReports];

    // Keep only last 10 reports to prevent storage bloat
    const trimmedReports = updatedReports.slice(0, 10);

    await AsyncStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(trimmedReports));

    return newReport;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

/**
 * Get a specific report by ID
 */
export async function getReportById(id: string): Promise<SavedReport | null> {
  try {
    const reports = await getSavedReports();
    return reports.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Error getting report by ID:', error);
    return null;
  }
}

/**
 * Delete a specific report
 */
export async function deleteReport(id: string): Promise<void> {
  try {
    const reports = await getSavedReports();
    const filteredReports = reports.filter(r => r.id !== id);
    await AsyncStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(filteredReports));
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}

/**
 * Clear all saved reports
 */
export async function clearAllReports(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REPORT_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing reports:', error);
    throw error;
  }
}

/**
 * Get the most recent report for a given period (for caching)
 */
export async function getRecentReportForPeriod(
  period: string,
  maxAgeMs: number = 60 * 60 * 1000 // 1 hour default
): Promise<SavedReport | null> {
  try {
    const reports = await getSavedReports();
    const now = Date.now();

    // Find most recent report for this period within the max age
    const recentReport = reports.find(
      r => r.period === period && (now - r.createdAt) < maxAgeMs
    );

    return recentReport || null;
  } catch (error) {
    console.error('Error getting recent report:', error);
    return null;
  }
}

/**
 * Format a date for display
 */
export function formatReportDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format expiration time for display
 */
export function formatExpiresIn(expiresAt: number): string {
  const now = Date.now();
  const diffMs = expiresAt - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Expired';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${diffDays} days`;
  }
}
