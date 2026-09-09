"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, ArrowLeft } from "lucide-react";

export default function MockFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    email: "",
    satisfaction: "Satisfied",
    feedback: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      course: "",
      email: "",
      satisfaction: "Satisfied",
      feedback: ""
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
            Educational Mock Form
          </span>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-fadeIn">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Student Feedback Survey</h1>
            <p className="text-slate-600 text-base mb-6 freebirdFormviewerViewResponseConfirmationMessage font-medium">
              Your response has been recorded.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs font-mono text-slate-700 mb-6">
              <div className="font-semibold text-slate-900 mb-2">Recorded Payload:</div>
              <div>Name: {formData.name || "(none)"}</div>
              <div>Course: {formData.course || "(none)"}</div>
              <div>Email: {formData.email || "(none)"}</div>
              <div>Satisfaction: {formData.satisfaction}</div>
              <div>Feedback: {formData.feedback || "(none)"}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-slate-500" />
                Submit another response
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Header Card */}
            <div className="bg-white rounded-xl shadow-sm border-t-8 border-t-blue-600 border border-slate-200 p-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Student Feedback Survey</h1>
              <p className="text-slate-600 text-sm">
                This mock form mirrors standard Google Form attributes (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs">role=&quot;textbox&quot;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">role=&quot;radiogroup&quot;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">role=&quot;button&quot;</code>) for safe local Playwright testing.
              </p>
              <div className="mt-3 text-xs text-rose-500 font-medium">* Indicates required question</div>
            </div>

            {/* Question 1: Student Name */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                1. Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                role="textbox"
                required
                placeholder="Your answer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 outline-none py-2 text-sm text-slate-800 transition"
              />
            </div>

            {/* Question 2: Academic Course */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                2. Academic Course <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                role="textbox"
                required
                placeholder="Your answer"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 outline-none py-2 text-sm text-slate-800 transition"
              />
            </div>

            {/* Question 3: University Email */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                3. University Email Address
              </label>
              <input
                type="text"
                role="textbox"
                placeholder="Your answer"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-600 outline-none py-2 text-sm text-slate-800 transition"
              />
            </div>

            {/* Question 4: Satisfaction Rating (Radios) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                4. Course Satisfaction Level <span className="text-rose-500">*</span>
              </label>
              <div role="radiogroup" className="space-y-2.5">
                {["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"].map((opt) => (
                  <label
                    key={opt}
                    role="radio"
                    aria-label={opt}
                    className="flex items-center space-x-3 cursor-pointer select-none text-sm text-slate-700 hover:text-slate-900"
                  >
                    <input
                      type="radio"
                      name="satisfaction"
                      value={opt}
                      checked={formData.satisfaction === opt}
                      onChange={() => setFormData({ ...formData, satisfaction: opt })}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 5: Feedback Notes (Textarea) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                5. Additional Feedback or Comments
              </label>
              <textarea
                rows={3}
                placeholder="Your answer"
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <div
                role="button"
                tabIndex={0}
                onClick={handleSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-sm hover:bg-blue-700 cursor-pointer transition select-none"
              >
                Submit
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear form
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
