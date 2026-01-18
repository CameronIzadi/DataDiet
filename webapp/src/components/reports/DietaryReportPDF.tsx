import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { Insights, BloodWork } from '@/types';

// Using built-in Helvetica font for reliability (no external font loading)

const colors = {
  primary: '#1a1a1a',
  secondary: '#4a5568',
  accent: '#2d6a4f',
  accentLight: '#d8f3dc',
  warning: '#c9184a',
  warningLight: '#ffe5ec',
  caution: '#e07900',
  cautionLight: '#fff3cd',
  success: '#2d6a4f',
  successLight: '#d8f3dc',
  border: '#e2e8f0',
  background: '#f8fafc',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.primary,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.accent,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  brandTagline: {
    fontSize: 9,
    color: colors.secondary,
    marginTop: 2,
  },
  headerRight: {
    textAlign: 'right',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 9,
    color: colors.secondary,
  },
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  // Executive Summary
  summaryBox: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.secondary,
  },
  // Table styles
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  tableCell: {
    fontSize: 10,
    color: colors.primary,
  },
  tableCellSecondary: {
    fontSize: 10,
    color: colors.secondary,
  },
  // Status badges
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusElevated: {
    backgroundColor: colors.warningLight,
  },
  statusMonitor: {
    backgroundColor: colors.cautionLight,
  },
  statusNormal: {
    backgroundColor: colors.successLight,
  },
  statusTextElevated: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusTextMonitor: {
    color: colors.caution,
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusTextNormal: {
    color: colors.success,
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Finding cards
  findingCard: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  findingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  findingLabel: {
    fontSize: 9,
    color: colors.secondary,
    marginTop: 2,
  },
  findingDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.secondary,
    marginTop: 8,
  },
  // Recommendations
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 4,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationNumberText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 8,
    color: colors.secondary,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.secondary,
  },
  // Disclaimer
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  disclaimerText: {
    fontSize: 8,
    color: colors.secondary,
    lineHeight: 1.5,
  },
  // Data grid
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  dataCard: {
    width: '48%',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dataCardLabel: {
    fontSize: 8,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dataCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dataCardUnit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: colors.secondary,
  },
});

interface ReportData {
  insights: Insights;
  bloodWork?: BloodWork;
  reportContent: string;
  generatedAt: Date;
  periodLabel: string;
  mealsAnalyzed: number;
}

const getStatusStyle = (concernLevel: string) => {
  switch (concernLevel) {
    case 'elevated':
      return { badge: styles.statusElevated, text: styles.statusTextElevated, label: 'ELEVATED' };
    case 'moderate':
      return { badge: styles.statusMonitor, text: styles.statusTextMonitor, label: 'MONITOR' };
    default:
      return { badge: styles.statusNormal, text: styles.statusTextNormal, label: 'NORMAL' };
  }
};

export const DietaryReportPDF: React.FC<ReportData> = ({
  insights,
  bloodWork,
  generatedAt,
  periodLabel,
  mealsAnalyzed,
}) => {
  const dateStr = generatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

  const processedMeatStatus = getStatusStyle(insights.processedMeat.concernLevel);
  const mealTimingStatus = getStatusStyle(insights.mealTiming.concernLevel);
  const plasticStatus = getStatusStyle(insights.plastic.concernLevel);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>DD</Text>
            </View>
            <View>
              <Text style={styles.brandName}>DataDiet</Text>
              <Text style={styles.brandTagline}>AI-Powered Dietary Intelligence</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Dietary Pattern Analysis</Text>
            <Text style={styles.reportMeta}>Report Date: {dateStr}</Text>
            <Text style={styles.reportMeta}>ID: {reportId}</Text>
          </View>
        </View>

        {/* Report Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Overview</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataCard}>
              <Text style={styles.dataCardLabel}>Analysis Period</Text>
              <Text style={styles.dataCardValue}>{periodLabel}</Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataCardLabel}>Meals Analyzed</Text>
              <Text style={styles.dataCardValue}>{mealsAnalyzed}</Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataCardLabel}>Date Range</Text>
              <Text style={styles.dataCardValue}>{insights.dateRange}</Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataCardLabel}>Data Completeness</Text>
              <Text style={styles.dataCardValue}>
                {Math.min(100, Math.round((mealsAnalyzed / 56) * 100))}
                <Text style={styles.dataCardUnit}>%</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Clinical Findings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Findings Summary</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Parameter</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Observed</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Threshold</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Status</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '35%' }]}>Processed Meat</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{insights.processedMeat.perWeek.toFixed(1)} srv/week</Text>
              <Text style={[styles.tableCellSecondary, { width: '20%' }]}>&lt;3 srv/week</Text>
              <View style={{ width: '20%' }}>
                <View style={[styles.statusBadge, processedMeatStatus.badge]}>
                  <Text style={processedMeatStatus.text}>{processedMeatStatus.label}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, { width: '35%' }]}>Late-Night Eating</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{insights.mealTiming.lateMealPercent}% of meals</Text>
              <Text style={[styles.tableCellSecondary, { width: '20%' }]}>&lt;15%</Text>
              <View style={{ width: '20%' }}>
                <View style={[styles.statusBadge, mealTimingStatus.badge]}>
                  <Text style={mealTimingStatus.text}>{mealTimingStatus.label}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '35%' }]}>Plastic Exposure</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{insights.plastic.count} instances</Text>
              <Text style={[styles.tableCellSecondary, { width: '20%' }]}>Minimize</Text>
              <View style={{ width: '20%' }}>
                <View style={[styles.statusBadge, plasticStatus.badge]}>
                  <Text style={plasticStatus.text}>{plasticStatus.label}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, { width: '35%' }]}>Avg. Dinner Time</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{insights.mealTiming.avgDinnerTime}</Text>
              <Text style={[styles.tableCellSecondary, { width: '20%' }]}>Before 8 PM</Text>
              <View style={{ width: '20%' }}>
                <View style={[styles.statusBadge, styles.statusNormal]}>
                  <Text style={styles.statusTextNormal}>NOTE</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Key Findings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Analysis</Text>

          <View style={styles.findingCard}>
            <View style={styles.findingHeader}>
              <View>
                <Text style={styles.findingTitle}>Processed Meat Consumption</Text>
                <Text style={styles.findingLabel}>WHO IARC Group 1 Carcinogen</Text>
              </View>
              <View>
                <Text style={styles.findingValue}>{insights.processedMeat.perWeek.toFixed(1)}</Text>
                <Text style={styles.findingLabel}>servings/week</Text>
              </View>
            </View>
            <Text style={styles.findingDescription}>
              Processed meat is classified as carcinogenic to humans by the WHO. Meta-analyses show an 18% increased colorectal cancer risk per 50g/day. Also associated with cardiovascular disease and type 2 diabetes.
            </Text>
          </View>

          <View style={styles.findingCard}>
            <View style={styles.findingHeader}>
              <View>
                <Text style={styles.findingTitle}>Circadian Eating Pattern</Text>
                <Text style={styles.findingLabel}>Meals consumed after 9 PM</Text>
              </View>
              <View>
                <Text style={styles.findingValue}>{insights.mealTiming.lateMealPercent}%</Text>
                <Text style={styles.findingLabel}>of total meals</Text>
              </View>
            </View>
            <Text style={styles.findingDescription}>
              Late eating disrupts circadian glucose regulation and is associated with impaired glucose tolerance, elevated triglycerides, reduced diet-induced thermogenesis, and compromised sleep architecture.
            </Text>
          </View>

          <View style={styles.findingCard}>
            <View style={styles.findingHeader}>
              <View>
                <Text style={styles.findingTitle}>Single-Use Plastic Exposure</Text>
                <Text style={styles.findingLabel}>Microplastic and BPA risk factor</Text>
              </View>
              <View>
                <Text style={styles.findingValue}>{insights.plastic.count}</Text>
                <Text style={styles.findingLabel}>exposures total</Text>
              </View>
            </View>
            <Text style={styles.findingDescription}>
              Emerging research links microplastic ingestion and BPA/phthalate exposure to endocrine disruption, metabolic dysfunction, and oxidative stress. The precautionary principle supports minimizing exposure.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>DataDiet | AI-Powered Dietary Surveillance</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* Page 2 - Blood Work & Recommendations */}
      <Page size="A4" style={styles.page}>
        {/* Blood Work Correlation (if available) */}
        {bloodWork && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Laboratory Correlation Analysis</Text>
            <Text style={[styles.reportMeta, { marginBottom: 10 }]}>
              Specimen Date: {bloodWork.testDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Biomarker</Text>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Result</Text>
                <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Reference</Text>
                <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Interpretation</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '30%' }]}>Total Cholesterol</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{bloodWork.totalCholesterol} mg/dL</Text>
                <Text style={[styles.tableCellSecondary, { width: '25%' }]}>&lt;200 mg/dL</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {bloodWork.totalCholesterol >= 240 ? 'Elevated' : bloodWork.totalCholesterol >= 200 ? 'Borderline' : 'Desirable'}
                </Text>
              </View>

              <View style={[styles.tableRow, styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { width: '30%' }]}>LDL Cholesterol</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{bloodWork.ldl} mg/dL</Text>
                <Text style={[styles.tableCellSecondary, { width: '25%' }]}>&lt;100 mg/dL</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {bloodWork.ldl >= 160 ? 'High' : bloodWork.ldl >= 130 ? 'Borderline' : 'Near Optimal'}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '30%' }]}>HDL Cholesterol</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{bloodWork.hdl} mg/dL</Text>
                <Text style={[styles.tableCellSecondary, { width: '25%' }]}>&gt;40 mg/dL</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {bloodWork.hdl < 40 ? 'Low Risk Factor' : bloodWork.hdl >= 60 ? 'Cardioprotective' : 'Acceptable'}
                </Text>
              </View>

              <View style={[styles.tableRow, styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { width: '30%' }]}>Triglycerides</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{bloodWork.triglycerides} mg/dL</Text>
                <Text style={[styles.tableCellSecondary, { width: '25%' }]}>&lt;150 mg/dL</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {bloodWork.triglycerides >= 200 ? 'High' : bloodWork.triglycerides >= 150 ? 'Borderline' : 'Normal'}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '30%' }]}>Fasting Glucose</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{bloodWork.fastingGlucose} mg/dL</Text>
                <Text style={[styles.tableCellSecondary, { width: '25%' }]}>&lt;100 mg/dL</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {bloodWork.fastingGlucose >= 126 ? 'Diabetic Range' : bloodWork.fastingGlucose >= 100 ? 'Prediabetic' : 'Normal'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Clinical Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Recommendations</Text>
          <Text style={[styles.summaryText, { marginBottom: 16 }]}>
            Based on the dietary surveillance data, the following evidence-based interventions are recommended for discussion with the patient:
          </Text>

          {insights.processedMeat.concernLevel !== 'low' && (
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationNumber}>
                <Text style={styles.recommendationNumberText}>1</Text>
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Reduce Processed Meat Consumption</Text>
                <Text style={styles.recommendationText}>
                  Target: &lt;3 servings per week. Replace with lean proteins, legumes, or fish. Expected benefit: Reduced colorectal cancer risk and improved cardiovascular markers.
                </Text>
              </View>
            </View>
          )}

          {insights.mealTiming.concernLevel !== 'low' && (
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationNumber}>
                <Text style={styles.recommendationNumberText}>2</Text>
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Optimize Meal Timing</Text>
                <Text style={styles.recommendationText}>
                  Target: Complete dinner by 8 PM. Implement time-restricted eating window of 10-12 hours. Expected benefit: Improved glucose metabolism and triglyceride levels.
                </Text>
              </View>
            </View>
          )}

          {insights.plastic.concernLevel !== 'low' && (
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationNumber}>
                <Text style={styles.recommendationNumberText}>3</Text>
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Minimize Plastic Container Use</Text>
                <Text style={styles.recommendationText}>
                  Switch to glass or stainless steel containers. Avoid heating food in plastic. Use filtered tap water instead of bottled water. Expected benefit: Reduced microplastic and endocrine disruptor exposure.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>4</Text>
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Increase Dietary Documentation</Text>
              <Text style={styles.recommendationText}>
                Current logging rate: {Math.min(100, Math.round((mealsAnalyzed / 56) * 100))}%. Target: Log all meals consistently for more accurate pattern analysis and personalized recommendations.
              </Text>
            </View>
          </View>
        </View>

        {/* Data Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Quality & Methodology</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataCard}>
              <Text style={styles.dataCardLabel}>Documentation Rate</Text>
              <Text style={styles.dataCardValue}>
                {Math.min(100, Math.round((mealsAnalyzed / 56) * 100))}%
              </Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataCardLabel}>Sample Size</Text>
              <Text style={styles.dataCardValue}>{mealsAnalyzed} meals</Text>
            </View>
          </View>
          <Text style={[styles.findingDescription, { marginTop: 10 }]}>
            Methodology: AI-assisted dietary pattern recognition with passive meal logging. Limitations include portion size estimation variability, potential documentation bias, and image recognition accuracy dependent on photo quality.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This report was generated by DataDiet&apos;s AI-powered dietary surveillance platform. It is intended to facilitate clinical discussion and does not constitute medical advice or diagnosis. All clinical decisions should be made by qualified healthcare providers based on comprehensive patient evaluation. The information presented reflects patterns identified from patient-logged data and should be interpreted within the broader clinical context.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>DataDiet | AI-Powered Dietary Surveillance</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default DietaryReportPDF;
