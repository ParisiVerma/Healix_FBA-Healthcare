import React, { useState } from 'react';
import { UserProfile, ActiveTab } from '../types';
import { storage } from '../utils/storage';
import jsPDF from 'jspdf';
import { 
  Heart, 
  Activity, 
  Pill, 
  Stethoscope, 
  MapPin, 
  ExternalLink,
  Scale,
  Ruler,
  Droplet,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  FileText,
  Download,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileDashboardProps {
  user: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  user,
  setActiveTab,
}) => {
  // BMI calculation
  const calculateBMI = () => {
    try {
      const w = parseFloat(user.weight);
      const h = parseFloat(user.height);
      if (h > 0 && w > 0) {
        const heightM = h / 100;
        const bmi = w / (heightM * heightM);
        let category = 'Normal';
        let color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        
        if (bmi < 18.5) {
          category = 'Underweight';
          color = 'text-amber-600 bg-amber-50 border-amber-200';
        } else if (bmi < 25) {
          category = 'Normal Weight';
          color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (bmi < 30) {
          category = 'Overweight';
          color = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
          category = 'Obese';
          color = 'text-rose-600 bg-rose-50 border-rose-200';
        }

        return {
          score: bmi.toFixed(1),
          category,
          color,
        };
      }
    } catch {
      // fallback
    }
    return { score: '--', category: 'Set weight & height', color: 'text-slate-500 bg-slate-100 border-slate-200' };
  };

  const bmiData = calculateBMI();

  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const doc = new jsPDF();
      const medicines = storage.getMedicines();

      // Primary Colors
      const primaryColor = [13, 148, 136]; // Teal #0d9488
      const darkColor = [15, 23, 42]; // Slate-900

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('HEALIX HEALTHCARE REPORT', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 26);

      // Patient Profile Section
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Personal Vitals & Profile', 14, 45);

      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 48, 196, 48);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Name:', 14, 57);
      doc.setFont('helvetica', 'normal');
      doc.text(user.username, 55, 57);

      doc.setFont('helvetica', 'bold');
      doc.text('Email / ID:', 14, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(user.email, 55, 65);

      doc.setFont('helvetica', 'bold');
      doc.text('Age / Gender:', 14, 73);
      doc.setFont('helvetica', 'normal');
      doc.text(`${user.age || '25'} yrs / ${user.gender || 'Female'}`, 55, 73);

      doc.setFont('helvetica', 'bold');
      doc.text('Weight / Height:', 14, 81);
      doc.setFont('helvetica', 'normal');
      doc.text(`${user.weight || '--'} kg / ${user.height || '--'} cm`, 55, 81);

      doc.setFont('helvetica', 'bold');
      doc.text('Blood Group:', 14, 89);
      doc.setFont('helvetica', 'normal');
      doc.text(user.blood || 'O+', 55, 89);

      // BMI calculation
      let bmiVal = '--';
      let bmiCat = 'Not specified';
      const w = parseFloat(user.weight);
      const h = parseFloat(user.height);
      if (w > 0 && h > 0) {
        const bmi = w / ((h / 100) * (h / 100));
        bmiVal = bmi.toFixed(1);
        bmiCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese';
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Body Mass Index (BMI):', 14, 97);
      doc.setFont('helvetica', 'normal');
      doc.text(`${bmiVal} (${bmiCat})`, 60, 97);

      // Medication Tracker History Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medication Prescription Schedule & Tracking History', 14, 115);

      doc.line(14, 118, 196, 118);

      let yPos = 128;
      if (medicines.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No active prescriptions logged in tracker.', 14, yPos);
        yPos += 12;
      } else {
        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(14, yPos - 5, 182, 8, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Medicine Name', 16, yPos);
        doc.text('Dosage', 80, yPos);
        doc.text('Frequency', 120, yPos);
        doc.text('Status Today', 160, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        medicines.forEach((med) => {
          doc.text(med.name, 16, yPos);
          doc.text(med.dosage, 80, yPos);
          doc.text(med.frequency, 120, yPos);
          doc.text(med.taken ? '[X] Dose Taken' : '[ ] Pending', 160, yPos);
          yPos += 8;
        });
      }

      // Footer Disclaimer
      yPos = Math.max(yPos + 20, 240);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('DISCLAIMER: This report is generated by Healix Health Companion for personal reference.', 14, yPos);
      doc.text('Please share this report with your licensed medical practitioner during clinical visits.', 14, yPos + 5);

      const fileName = `Healix_Health_Report_${user.username.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const openSearch = (query: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Banner Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-900/10 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-teal-100 mb-3 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Health Dashboard Verified</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.username}!
            </h1>
            <p className="text-teal-100 text-sm sm:text-base mt-2 leading-relaxed">
              Here is your daily medical profile summary, medication progress, and health vitals reference.
            </p>
          </div>

          {/* Export PDF Button in Banner */}
          <div className="relative z-10 flex-shrink-0">
            <button
              id="btn-export-pdf-report"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-teal-800 hover:bg-teal-50 font-bold rounded-2xl shadow-lg shadow-black/10 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-teal-600" />
                  <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decorative background vectors */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Activity className="w-72 h-72 text-white" />
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Profile & BMI */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vitals & BMI Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <span>Personal Medical Profile</span>
              </h2>
              <span className="text-xs text-slate-600">ID: {user.email}</span>
            </div>

            {/* BMI Banner */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">Body Mass Index (BMI)</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">{bmiData.score}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bmiData.color}`}>
                    {bmiData.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Calculated from weight ({user.weight} kg) & height ({user.height} cm).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Standard Range: 18.5 – 24.9</span>
              </div>
            </div>

            {/* Grid of Profile Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Age & Gender</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{user.age || '25'} yrs ({user.gender || 'Female'})</p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold mb-1">
                  <Scale className="w-3.5 h-3.5 text-teal-600" />
                  <span>Weight</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{user.weight || '--'} kg</p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold mb-1">
                  <Ruler className="w-3.5 h-3.5 text-teal-600" />
                  <span>Height</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{user.height || '--'} cm</p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold mb-1">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>Blood Group</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{user.blood || 'O+'}</p>
              </div>
            </div>
          </div>

          {/* Quick Health Guidelines (Search external medical links) */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200" id="advisorySectionTitle">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <span>Medical Vitals Guidelines</span>
            </h2>
            <p className="text-xs text-slate-600 mb-5">
              Quickly verify standard medical standards for heart rate, blood pressure, and blood glucose levels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                id="btn-hr-guidelines"
                onClick={() => openSearch('ideal heart rate range adult')}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Ideal Heart Rate</h3>
                <p className="text-xs text-slate-600 mt-1">Normal: 60–100 BPM at rest</p>
              </button>

              <button
                id="btn-bp-guidelines"
                onClick={() => openSearch('ideal blood pressure range mmhg')}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Blood Pressure</h3>
                <p className="text-xs text-slate-600 mt-1">Normal: 120/80 mmHg</p>
              </button>

              <button
                id="btn-sugar-guidelines"
                onClick={() => openSearch('normal blood sugar levels mg/dl')}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Blood Sugar</h3>
                <p className="text-xs text-slate-600 mt-1">Fasting: 70–99 mg/dL</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Feature Launchers */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Features</h2>

            <div className="space-y-3">
              {/* Medicine Tracker Shortcut */}
              <div 
                onClick={() => setActiveTab('medicines')}
                className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 hover:bg-teal-50 hover:border-teal-300 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">Medicine Tracker</h3>
                      <p className="text-xs text-slate-600">Schedule & log daily doses</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Symptom Checker Shortcut */}
              <div 
                onClick={() => setActiveTab('symptoms')}
                className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">Symptom Checker</h3>
                      <p className="text-xs text-slate-600">Instant triage & guidance</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Nearby Medical Stores Shortcut */}
              <div 
                onClick={() => setActiveTab('pharmacies')}
                className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Medical Stores</h3>
                      <p className="text-xs text-slate-600">Find nearby pharmacies</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Notice Card */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5">
            <div className="flex gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">Medical Disclaimer</span>
                Healix is designed as a personal health companion tool. It does not replace professional medical diagnosis, advice, or emergency triage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
