import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

const LAST_UPDATED = "15 May 2025";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-2 animate-in fade-in duration-500">
      <Link href="/about" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Privacy Policy</h1>
      </div>
      <p className="text-slate-400 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-slate prose-sm max-w-none space-y-8">

        <Section title="1. Introduction">
          College Achiever ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform at collegeachiever.in and its associated services.
        </Section>

        <Section title="2. Information We Collect">
          <b>Account information:</b> When you register, we collect your name, email address, and password (stored as a cryptographic hash — we never store plain-text passwords).<br /><br />
          <b>Profile data:</b> You may optionally provide your JEE rank, category, and home state to personalise predictions. This information is entirely optional.<br /><br />
          <b>Usage data:</b> We collect anonymised usage metrics such as pages visited, features used, and session duration to improve the product. This data cannot be traced back to an individual user.<br /><br />
          <b>Contact data:</b> If you submit a support request, we retain your name, email, and message content for the purpose of resolving your query.
        </Section>

        <Section title="3. How We Use Your Information">
          We use your data solely to:<br /><br />
          • Provide and improve the College Achiever platform<br />
          • Personalise predictions and results based on your profile<br />
          • Respond to support requests<br />
          • Send important service notifications (no marketing without explicit consent)<br />
          • Comply with legal obligations
        </Section>

        <Section title="4. Data Sharing and Disclosure">
          We do not sell, rent, or trade your personal information to third parties. We may share data only in the following limited circumstances:<br /><br />
          • <b>Service providers:</b> Trusted vendors who process data on our behalf (hosting, analytics) under strict confidentiality agreements<br />
          • <b>Legal requirement:</b> If required by law or a valid legal process<br />
          • <b>Business transfer:</b> In the event of a merger or acquisition, you will be notified in advance
        </Section>

        <Section title="5. Data Security">
          We implement industry-standard security measures including TLS encryption for data in transit, PBKDF2 password hashing with SHA-512, and regular security audits. No method of transmission over the internet is 100% secure, but we take all reasonable precautions to protect your data.
        </Section>

        <Section title="6. Data Retention">
          We retain your account data for as long as your account is active. You may request complete deletion of your account and all associated data by emailing privacy@collegeachiever.in. We will process deletion requests within 30 days.
        </Section>

        <Section title="7. Cookies">
          We use only functional cookies necessary for session management and authentication. We do not use tracking or advertising cookies. You may disable cookies in your browser settings, though this may affect core functionality.
        </Section>

        <Section title="8. Children's Privacy">
          College Achiever is intended for students aged 16 and above. We do not knowingly collect data from children under 16 without verifiable parental consent. If you believe a minor has provided us with data, contact us immediately.
        </Section>

        <Section title="9. Your Rights">
          You have the right to:<br /><br />
          • Access the personal data we hold about you<br />
          • Correct inaccurate data<br />
          • Request deletion of your data<br />
          • Withdraw consent at any time<br /><br />
          To exercise these rights, email privacy@collegeachiever.in.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by email or a prominent notice in the application. Continued use after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="11. Contact">
          For privacy-related questions or requests:<br /><br />
          <strong>College Achiever Privacy Team</strong><br />
          Email: privacy@collegeachiever.in<br />
          Address: Bengaluru, Karnataka — 560 001, India
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
