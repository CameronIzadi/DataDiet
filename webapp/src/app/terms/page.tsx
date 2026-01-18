'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-display text-3xl text-warm-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-warm-400 mb-8">Last updated: January 2025</p>

          <div className="prose prose-warm max-w-none">
            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-warm-600 mb-4">
              By accessing and using Dietary Black Box (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-warm-600 mb-4">
              Dietary Black Box is a dietary tracking application that allows users to log meals,
              track dietary patterns, and generate reports for healthcare providers. The Service
              uses AI to analyze food images and provide insights.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">3. Medical Disclaimer</h2>
            <p className="text-warm-600 mb-4">
              The Service is not a medical device and does not provide medical advice, diagnosis,
              or treatment. The information provided is for informational purposes only and should
              not replace professional medical consultation. Always consult with a qualified
              healthcare provider for medical advice.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">4. User Responsibilities</h2>
            <p className="text-warm-600 mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-warm-600 mb-4 space-y-2">
              <li>Provide accurate information when using the Service</li>
              <li>Use the Service only for its intended purpose</li>
              <li>Not attempt to circumvent any security measures</li>
              <li>Not use the Service for any unlawful purpose</li>
            </ul>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-warm-600 mb-4">
              All content, features, and functionality of the Service are owned by Dietary Black Box
              and are protected by intellectual property laws.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-warm-600 mb-4">
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be
              liable for any indirect, incidental, special, or consequential damages arising from
              your use of the Service.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">7. Changes to Terms</h2>
            <p className="text-warm-600 mb-4">
              We reserve the right to modify these terms at any time. Continued use of the Service
              after changes constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-lg font-semibold text-warm-800 mt-8 mb-4">8. Contact</h2>
            <p className="text-warm-600 mb-4">
              For questions about these Terms, please contact us through the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
