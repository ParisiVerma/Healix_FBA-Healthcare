import React, { useState, useEffect } from 'react';
import { Medicine } from '../types';
import { storage } from '../utils/storage';
import { useNotification } from '../context/NotificationContext';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Bell,
  Sparkles,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const MedicineTracker: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken'>('all');

  // New Medicine Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [time, setTime] = useState('08:00 AM');
  const [notes, setNotes] = useState('');
  const [recentlyAddedNotif, setRecentlyAddedNotif] = useState<string | null>(null);

  const {
    schedule10SecDemoNotification,
    setOnMarkTakenHandler,
    requestNotificationPermission,
    permissionGranted
  } = useNotification();

  // Load saved medicines on mount
  useEffect(() => {
    const loaded = storage.getMedicines();
    setMedicines(loaded);
  }, []);

  // Register callback so when user clicks "Mark as Taken" on pop-up notification, it updates state
  useEffect(() => {
    setOnMarkTakenHandler((medicineName: string) => {
      setMedicines((prevMeds) => {
        const updated = prevMeds.map((med) =>
          med.name.toLowerCase() === medicineName.toLowerCase() ? { ...med, taken: true } : med
        );
        storage.saveMedicines(updated);
        return updated;
      });
    });
  }, [setOnMarkTakenHandler]);

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    const newMed = storage.addMedicine({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times: [time],
      taken: false,
    });

    setMedicines((prev) => [newMed, ...prev]);

    // Schedule the demo notification pop-up after a lag of 10 seconds!
    schedule10SecDemoNotification(newMed.name, newMed.dosage, time);

    setRecentlyAddedNotif(newMed.name);
    setTimeout(() => setRecentlyAddedNotif(null), 5000);

    // Reset Form
    setName('');
    setDosage('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleToggleTaken = (id: string) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, taken: !m.taken } : m
    );
    setMedicines(updated);
    storage.saveMedicines(updated);
  };

  const handleDelete = (id: string) => {
    const updated = storage.deleteMedicine(id);
    setMedicines(updated);
  };

  const filteredMedicines = medicines.filter((m) => {
    if (filter === 'pending') return !m.taken;
    if (filter === 'taken') return m.taken;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Smart Medication Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Medicine Schedule & Reminders
            </h1>
            <p className="mt-2 text-teal-100 text-sm max-w-xl">
              Keep track of your daily prescriptions. Adding a new medicine schedules an automatic demo alert pop-up 10 seconds later!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!permissionGranted && (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-md border border-white/30 transition-all flex items-center space-x-2 active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>Enable System Notifications</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-teal-800 font-bold text-sm rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Plus className="w-5 h-5 text-teal-600" />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demonstration Info Alert */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start space-x-3 text-emerald-900 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-emerald-950">10-Second Demonstration Mode Active</p>
          <p className="text-emerald-800 mt-0.5">
            When you click <span className="font-bold text-emerald-900">"Add Medicine"</span>, a popup notification with chime sound will automatically appear after a <span className="font-bold text-emerald-900">10-second delay</span>. You can also test the 10s notification on any existing medicine below!
          </p>
        </div>
      </div>

      {/* Confirmation Toast if medicine recently added */}
      {recentlyAddedNotif && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-teal-500/40 flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-sm text-teal-300">Added "{recentlyAddedNotif}"!</p>
              <p className="text-xs text-slate-300">
                Demo notification will pop up in 10 seconds...
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-teal-500 text-slate-950 font-extrabold rounded-lg">
            10s Delay
          </span>
        </div>
      )}

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'pending', 'taken'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filter === tab
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Medicines' : tab}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center space-x-4">
          <span>Total: <strong className="text-slate-900">{medicines.length}</strong></span>
          <span>Pending: <strong className="text-amber-600">{medicines.filter((m) => !m.taken).length}</strong></span>
          <span>Taken: <strong className="text-emerald-600">{medicines.filter((m) => m.taken).length}</strong></span>
        </div>
      </div>

      {/* Medicine List */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No medicines found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {filter === 'all'
              ? 'Click "Add Medicine" to create your first prescription schedule and trigger a demo notification.'
              : `No medicines in the "${filter}" category.`}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-6 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                med.taken ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        med.taken
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-teal-100/70 text-teal-700'
                      }`}
                    >
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {med.name}
                      </h4>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      med.taken
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {med.taken ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Taken</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Schedule Times */}
                <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Time:
                  </span>
                  {med.times.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => schedule10SecDemoNotification(med.name, med.dosage, med.times[0] || 'Scheduled')}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                  title="Test 10-second notification lag"
                >
                  <Bell className="w-3.5 h-3.5 text-teal-600" />
                  <span>Test 10s Alarm</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleTaken(med.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1 ${
                      med.taken
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {med.taken ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mark Untaken</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Taken</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden p-6 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Add New Medicine</h3>
                  <p className="text-xs text-slate-500">Schedules a 10s demo alert automatically</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Paracetamol, Aspirin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg, 1 tablet"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 text-sm font-medium bg-white"
                  >
                    <option value="Daily">Once Daily</option>
                    <option value="Twice daily">Twice Daily</option>
                    <option value="Three times daily">Three Times Daily</option>
                    <option value="Every 8 hours">Every 8 Hours</option>
                    <option value="As needed">As Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Adding this medicine will launch a <strong>10-second countdown</strong>, triggering an interactive popup reminder for demonstration!
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all active:scale-95 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save & Schedule Demo (10s)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
