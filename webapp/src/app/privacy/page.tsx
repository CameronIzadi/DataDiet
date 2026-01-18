'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-warm-500 hover:text-warm-700 transition-colors text-sm font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="card-elevated">
          <h1 className="text-display text-3xl text-warm-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-warm-400 mb-8">Last updated: January 2025</p>

          <div className="prose prose-warm max-w-none">
            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-warm-600 mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-warm-600 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Email address and display name when you create an account</li>
              <li><strong>Meal Data:</strong> Photos and descriptions of meals you log</li>
              <li><strong>Health Data:</strong> Blood work results you optionally provide</li>
              <li><strong>Usage Data:</strong> How you interact with the application</li>
            </ul>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-warm-600 mb-4">Your information is used to:</p>
            <ul className="list-disc pl-6 text-warm-600 mb-4 space-y-2">
              <li>Provide and improve the Service</li>
              <li>Analyze your dietary patterns using AI</li>
              <li>Generate reports for your healthcare providers</li>
              <li>Send important service-related communications</li>
            </ul>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">3. Data Storage</h2>
            <p className="text-warm-600 mb-4">
              Your data is stored securely using Firebase services. Meal images and data are
              associated with your account and are only accessible by you.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">4. AI Processing</h2>
            <p className="text-warm-600 mb-4">
              Meal images are processed using Google&apos;s Gemini AI to identify foods and generate
              insights. This processing occurs in real-time and images are not stored by the AI
              service beyond the immediate analysis.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">5. Data Sharing</h2>
            <p className="text-warm-600 mb-4">
              We do not sell your personal data. Your data may be shared only in these circumstances:
            </p>
            <ul className="list-disc pl-6 text-warm-600 mb-4 space-y-2">
              <li>When you explicitly share a report with your healthcare provider</li>
              <li>With service providers who help operate the application (Firebase, Google AI)</li>
              <li>When required by law</li>
            </ul>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">6. Your Rights</h2>
            <p className="text-warm-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-warm-600 mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Opt out of non-essential data collection</li>
            </ul>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">7. Data Security</h2>
            <p className="text-warm-600 mb-4">
              We implement appropriate security measures to protect your data, including encryption
              in transit and at rest, secure authentication, and regular security reviews.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-warm-600 mb-4">
              The Service is not intended for children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">9. Changes to Privacy Policy</h2>
            <p className="text-warm-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes through the application.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">10. Contact Us</h2>
            <p className="text-warm-600 mb-4">
              For privacy-related questions or concerns, please contact us through the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
