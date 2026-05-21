import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">About College Achiever</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          The definitive tool for serious JEE aspirants navigating JOSAA counselling. Data-driven insights to help you make the most important decision of your career.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            Every year, hundreds of thousands of students navigate the complex JOSAA counselling process with limited tools and high anxiety. College Achiever was built to replace guesswork with precision. By aggregating historical cutoff data, seat matrices, and complex allotment algorithms, we provide clear, actionable insights so students can confidently lock their choices.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-700">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="font-medium">100+ Institutions tracked</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
                <Mail className="h-4 w-4" />
              </div>
              <span className="font-medium">support@collegeachiever.in</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                <Phone className="h-4 w-4" />
              </div>
              <span className="font-medium">1800-123-4567</span>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Need help with your profile or subscription?</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent! (Mock)"); }}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Your name" className="bg-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" className="bg-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="How can we help you?" className="min-h-[100px] bg-white" required />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionItem value="item-1" className="border-b-0 px-4">
            <AccordionTrigger className="text-slate-900 font-medium hover:no-underline hover:text-indigo-600">
              How accurate is the College Predictor?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pb-4">
              Our predictor uses historical closing ranks from the past 3 years across all 6 rounds of JOSAA counselling. While no tool can guarantee admission due to changing seat matrices and candidate preferences, our model provides a highly reliable probability categorized into Safe, Moderate, and Ambitious tiers.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-t px-4">
            <AccordionTrigger className="text-slate-900 font-medium hover:no-underline hover:text-indigo-600">
              How does the Mock Simulator work?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pb-4">
              The simulator takes your ordered preference list and your rank/category, then runs it through our allotment engine based on last year's round-wise cutoffs. It mimics the JOSAA logic: checking choice 1, then choice 2, stopping at the first college where your rank clears the historical cutoff.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-t border-b-0 px-4">
            <AccordionTrigger className="text-slate-900 font-medium hover:no-underline hover:text-indigo-600">
              Is my data secure?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pb-4">
              Yes. Your rank and preference lists are stored securely and never shared with third parties or other candidates. You maintain full control over your profile.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
