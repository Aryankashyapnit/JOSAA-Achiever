import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Target, Database, ShieldCheck, Users, CheckCircle2, Send, Loader2 } from "lucide-react";
import { Link } from "wouter";

const TEAM = [
  { name: "Arjun Menon", role: "Founder & Product Lead", bio: "Former JEE aspirant who went through JOSAA counselling himself. Built College Achiever so no student has to navigate it blind again." },
  { name: "Priya Sharma", role: "Data & Engineering", bio: "IIT Bombay alumni. Architected the cutoff database and prediction engine using 5+ years of JOSAA historical data." },
  { name: "Rohan Das", role: "Design & UX", bio: "Believes great tools should feel calm and trustworthy, especially when you're making the most important decision of your career." },
];

const FAQS = [
  { q: "How accurate is the College Predictor?", a: "Our predictor uses historical closing ranks from 2022–2024 across all 6 rounds of JOSAA counselling. While no tool guarantees admission due to changing seat matrices and candidate preferences, our model provides a highly reliable probability categorised into Safe, Moderate, and Dream tiers. Accuracy is typically within 5–8% of actual cutoffs." },
  { q: "Which exams does College Achiever support?", a: "Currently, College Achiever supports JEE Main (for NITs, IIITs, and GFTIs) and JEE Advanced (for IITs) under the JOSAA counselling framework. We plan to add CSAB, JAC Delhi, and state-level counselling data in upcoming releases." },
  { q: "How does the Mock Counselling Simulator work?", a: "The simulator takes your ordered preference list and your rank and category, then runs it through our allotment engine based on last year's round-wise cutoffs. It mimics the JOSAA algorithm: checking preference 1, then preference 2, stopping at the first option where your rank clears the historical closing rank." },
  { q: "Is my data secure and private?", a: "Yes. Your rank, category, and preference lists are stored securely with encryption at rest and in transit. We never share your personal data with third parties or other candidates. You can request deletion of your account and all associated data at any time by writing to us." },
  { q: "How often is the cutoff data updated?", a: "We update cutoff data after each JOSAA round is officially announced on josaa.nic.in. Historical data from 2019 onwards is available in our database, with round-by-round detail for 2022–2024." },
];

export default function About() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-500 pb-16">

      {/* ── Hero ── */}
      <div className="text-center space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-700 text-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Our Story
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Built for the toughest week<br className="hidden sm:block" /> of a student's life
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          JOSAA counselling is a maze of cutoffs, categories, rounds, and deadlines. College Achiever was built to turn that anxiety into confidence — with real data, not guesswork.
        </p>
      </div>

      {/* ── Mission Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: "120+", label: "Institutes Tracked", icon: Database },
          { value: "64K+", label: "Cutoff Records", icon: Target },
          { value: "6", label: "JOSAA Rounds", icon: CheckCircle2 },
          { value: "Free", label: "Forever", icon: ShieldCheck },
        ].map((s) => (
          <Card key={s.label} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <s.icon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Mission ── */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            Every year, over 1.2 lakh students navigate JOSAA counselling with limited tools and enormous pressure. Most rely on WhatsApp forwards and year-old PDFs.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We built College Achiever to change that. By aggregating official round-wise cutoff data, seat matrices, and past allotment trends into a clean, fast tool — we give every aspirant the same quality of insight that used to require expensive coaching.
          </p>
          <p className="text-slate-600 leading-relaxed font-medium">
            Precise, trustworthy, and worth opening every day of counselling season.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: Target, title: "Data-driven predictions", desc: "No gut feelings. Every prediction is backed by 5 years of real JOSAA cutoffs.", color: "indigo" },
            { icon: ShieldCheck, title: "Privacy first", desc: "Your rank and data are yours. We never sell or share personal information.", color: "emerald" },
            { icon: Users, title: "Built for mobile", desc: "Designed from the ground up for the phone you actually use during counselling.", color: "violet" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-${f.color}-50`}>
                <f.icon className={`w-4 h-4 text-${f.color}-600`} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{f.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Team ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">The Team</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TEAM.map((t) => (
            <Card key={t.name} className="border-slate-100 shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base mb-4">
                  {t.name[0]}
                </div>
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-indigo-600 text-xs font-medium mt-0.5 mb-3">{t.role}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{t.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Contact ── */}
      <div id="contact" className="grid md:grid-cols-2 gap-8 scroll-mt-20">
        {/* Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Get in Touch</h2>
            <p className="text-slate-500 mt-2 leading-relaxed text-sm">
              Questions about your results, data accuracy, or anything else? We read every message and reply within 24 hours during counselling season.
            </p>
          </div>
          <div className="space-y-4">
            <ContactInfo icon={Mail} label="Email" value="support@collegeachiever.in" href="mailto:support@collegeachiever.in" />
            <ContactInfo icon={Phone} label="Helpline" value="+91 1800-123-4567" href="tel:+911800123456" />
            <ContactInfo icon={MapPin} label="Address" value="Bengaluru, Karnataka — 560 001" />
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-indigo-700 text-sm font-medium mb-1">Response time</p>
            <p className="text-indigo-600 text-xs leading-relaxed">
              During JOSAA counselling season (June–August), we typically respond within 4–6 hours. Off-season response time is within 1–2 business days.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">Message Sent</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                  Thanks for reaching out. We'll get back to you within 24 hours at the email you provided.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-indigo-600 text-sm font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
                  <Input placeholder="Arjun Kumar" className="border-slate-200" required data-testid="input-contact-name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
                  <Input type="email" placeholder="arjun@example.com" className="border-slate-200" required data-testid="input-contact-email" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                  <Input type="tel" placeholder="+91 98765 43210" className="border-slate-200" data-testid="input-contact-phone" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Subject</label>
                  <Input placeholder="Predictor result seems off for my rank" className="border-slate-200" required data-testid="input-contact-subject" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Message</label>
                  <Textarea placeholder="Describe your question or issue..." className="border-slate-200 min-h-[110px] resize-none" required data-testid="textarea-contact-message" />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-semibold gap-2"
                  disabled={loading}
                  data-testid="button-contact-submit"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── FAQ ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className={i > 0 ? "border-t border-slate-100" : ""}>
              <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-slate-800 hover:text-indigo-600 hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-slate-500 text-sm leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* ── Legal Links ── */}
      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 mb-3">Legal</p>
        <div className="flex items-center justify-center gap-6">
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          <span className="text-slate-200">|</span>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="hover:opacity-80 transition-opacity block">{content}</a> : <div>{content}</div>;
}
