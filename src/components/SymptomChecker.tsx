import React, { useState } from 'react';
import { SymptomAnalysis } from '../types';
import { GoogleGenAI } from '@google/genai';
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Search, 
  Pill, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COMMON_SYMPTOMS = [
  'Headache',
  'Fever',
  'Cough',
  'Sore Throat',
  'Fatigue',
  'Nausea',
  'Stomach Pain',
  'Runny Nose',
  'Dizziness',
  'Body Aches',
  'Shortness of Breath',
  'Chest Tightness'
];

interface SymptomCheckerProps {
  onNavigatePharmacies?: () => void;
  onNavigateMedicines?: () => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  onNavigatePharmacies,
  onNavigateMedicines
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Headache', 'Fever']);
  const [customInput, setCustomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysis | null>(null);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!selectedSymptoms.includes(customInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customInput.trim()]);
    }
    setCustomInput('');
  };

  const runAnalysis = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a clinical AI triage assistant in a healthcare app named Healix.
Analyze the following patient symptoms: ${selectedSymptoms.join(', ')}.
Provide a concise, structured response JSON with the following format:
{
  "title": "Short Diagnosis / Primary Possibility",
  "severity": "urgent" or "warning" or "info",
  "description": "Clear 2-3 sentence clinical summary.",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAnalysisResult({
            title: parsed.title || 'Symptom Assessment Summary',
            severity: parsed.severity || 'warning',
            description: parsed.description || 'Analysis based on reported symptom patterns.',
            recommendations: parsed.recommendations || ['Stay hydrated and monitor temperature.', 'Consult a medical professional if symptoms persist.'],
          });
          setIsAnalyzing(false);
          return;
        }
      } catch (err) {
        console.warn('Gemini API call error, falling back to rule engine:', err);
      }
    }

    // Standard clinical fallback rule engine
    setTimeout(() => {
      const hasUrgent = selectedSymptoms.some((s) =>
        ['Chest Tightness', 'Shortness of Breath', 'Severe Bleeding'].includes(s)
      );
      const hasWarning = selectedSymptoms.some((s) =>
        ['Fever', 'Nausea', 'Dizziness', 'Stomach Pain'].includes(s)
      );

      if (hasUrgent) {
        setAnalysisResult({
          title: 'Immediate Clinical Evaluation Recommended',
          severity: 'urgent',
          description: 'Symptoms like chest tightness or difficulty breathing require prompt medical triage from a healthcare provider or emergency center.',
          recommendations: [
            'Seek immediate medical care or visit the nearest urgent care center.',
            'Avoid physical exertion while waiting for care.',
            'Keep your emergency contact informed.'
          ],
        });
      } else if (hasWarning) {
        setAnalysisResult({
          title: 'Acute Viral or Inflammation Pattern',
          severity: 'warning',
          description: 'Your symptoms match common acute upper respiratory or seasonal viral responses.',
          recommendations: [
            'Maintain adequate hydration with water and warm fluids.',
            'Rest adequately and monitor body temperature regularly.',
            'Consider over-the-counter pain or fever relief from a local pharmacy.',
            'Consult a physician if symptoms worsen after 48 hours.'
          ],
        });
      } else {
        setAnalysisResult({
          title: 'Mild Non-Emergent Symptoms',
          severity: 'info',
          description: 'The selected symptoms suggest mild localized irritation or temporary fatigue.',
          recommendations: [
            'Ensure adequate rest and hydration.',
            'Track your medication schedule in the Healix Medicine Tracker.',
            'Visit a nearby pharmacist for over-the-counter advice.'
          ],
        });
      }
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Symptom Checker & AI Triage</h1>
            <p className="text-slate-500 text-sm">
              Select your current symptoms for clinical guidance, severity assessment, and next steps.
            </p>
          </div>
        </div>
      </div>

      {/* Symptom Selection Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>Select Your Symptoms</span>
            <span className="text-xs font-normal text-slate-500">
              ({selectedSymptoms.length} selected)
            </span>
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isSelected ? `✓ ${symptom}` : `+ ${symptom}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            id="input-custom-symptom"
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type a custom symptom (e.g., ear pain, rash)..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs"
          >
            Add Symptom
          </button>
        </form>

        {/* Selected Badges */}
        {selectedSymptoms.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Active Assessment List
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    onClick={() => toggleSymptom(s)}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <button
          id="btn-analyze-symptoms"
          onClick={runAnalysis}
          disabled={selectedSymptoms.length === 0 || isAnalyzing}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Symptoms...' : 'Analyze Symptoms & Evaluate Triage'}</span>
        </button>
      </div>

      {/* Analysis Output */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
              analysisResult.severity === 'urgent'
                ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                : analysisResult.severity === 'warning'
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-teal-50/90 border-teal-200 text-teal-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {analysisResult.severity === 'urgent' ? (
                  <ShieldAlert className="w-8 h-8 text-rose-600 flex-shrink-0" />
                ) : analysisResult.severity === 'warning' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                ) : (
                  <Info className="w-8 h-8 text-teal-600 flex-shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    Triage Urgency: {analysisResult.severity.toUpperCase()}
                  </span>
                  <h2 className="text-xl font-bold">{analysisResult.title}</h2>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6 bg-white/60 p-4 rounded-2xl border border-black/5">
              {analysisResult.description}
            </p>

            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider opacity-80">
                Recommended Actions:
              </h3>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-black/10">
              {onNavigatePharmacies && (
                <button
                  onClick={onNavigatePharmacies}
                  className="py-3 px-4 bg-white text-slate-900 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs shadow-xs"
                >
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Locate Nearby Pharmacies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {onNavigateMedicines && (
                <button
                  onClick={onNavigateMedicines}
                  className="py-3 px-4 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs shadow-xs"
                >
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                  <span>Log Prescription in Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
