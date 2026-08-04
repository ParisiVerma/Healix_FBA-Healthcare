import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Bell, CheckCircle2, Clock, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ActiveNotification {
  id: string;
  medicineName: string;
  dosage: string;
  timeLabel: string;
  timestamp: Date;
}

export interface PendingDemoNotification {
  id: string;
  medicineName: string;
  dosage: string;
  secondsLeft: number;
}

interface NotificationContextType {
  schedule10SecDemoNotification: (medicineName: string, dosage: string, timeLabel?: string) => void;
  activePopup: ActiveNotification | null;
  pendingNotifications: PendingDemoNotification[];
  dismissPopup: () => void;
  onMarkTaken?: (medicineName: string) => void;
  setOnMarkTakenHandler: (handler: (medicineName: string) => void) => void;
  requestNotificationPermission: () => Promise<boolean>;
  permissionGranted: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Play a pleasant 2-tone notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Audio playback not supported or blocked by browser policy', e);
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePopup, setActivePopup] = useState<ActiveNotification | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState<PendingDemoNotification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [onMarkTakenHandler, setOnMarkTakenHandlerState] = useState<((medicineName: string) => void) | null>(null);

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      }
    }
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        setPermissionGranted(granted);
        return granted;
      }
      // Try Capacitor
      try {
        const perm = await LocalNotifications.requestPermissions();
        const granted = perm.display === 'granted';
        setPermissionGranted(granted);
        return granted;
      } catch {
        // Fallback
      }
    } catch {
      // Ignore
    }
    return false;
  };

  const schedule10SecDemoNotification = (medicineName: string, dosage: string, timeLabel = 'Now') => {
    const notifId = 'demo-' + Date.now();
    const initialPending: PendingDemoNotification = {
      id: notifId,
      medicineName,
      dosage,
      secondsLeft: 10,
    };

    setPendingNotifications((prev) => [...prev, initialPending]);

    // Setup Capacitor Native Local Notification if on device
    try {
      LocalNotifications.schedule({
        notifications: [
          {
            title: `⏰ Medicine Reminder: ${medicineName}`,
            body: `It's time to take your ${dosage} of ${medicineName}!`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 10000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      }).catch(() => {
        // Ignore fallback to web
      });
    } catch {
      // Ignore
    }

    // Countdown interval
    const intervalId = setInterval(() => {
      setPendingNotifications((prev) => {
        return prev
          .map((item) => {
            if (item.id === notifId) {
              return { ...item, secondsLeft: item.secondsLeft - 1 };
            }
            return item;
          })
          .filter((item) => item.secondsLeft >= 0);
      });
    }, 1000);

    // 10 second timeout for the popup
    setTimeout(() => {
      clearInterval(intervalId);
      setPendingNotifications((prev) => prev.filter((item) => item.id !== notifId));

      // Trigger active popup
      const newNotif: ActiveNotification = {
        id: notifId,
        medicineName,
        dosage,
        timeLabel,
        timestamp: new Date(),
      };

      setActivePopup(newNotif);
      playNotificationSound();

      // Send standard browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`⏰ Healix Reminder: ${medicineName}`, {
            body: `Time to take ${dosage} of ${medicineName}.`,
            icon: '/vite.svg',
          });
        } catch {
          // Ignore
        }
      }
    }, 10000);
  };

  const dismissPopup = () => {
    setActivePopup(null);
  };

  const setOnMarkTakenHandler = (handler: (medicineName: string) => void) => {
    setOnMarkTakenHandlerState(() => handler);
  };

  return (
    <NotificationContext.Provider
      value={{
        schedule10SecDemoNotification,
        activePopup,
        pendingNotifications,
        dismissPopup,
        onMarkTaken: onMarkTakenHandler || undefined,
        setOnMarkTakenHandler,
        requestNotificationPermission,
        permissionGranted,
      }}
    >
      {children}

      {/* Pending Demo Countdown Toast Header */}
      <AnimatePresence>
        {pendingNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
          >
            {pendingNotifications.map((notif) => (
              <div
                key={notif.id}
                className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-teal-500/30 flex items-center justify-between text-xs sm:text-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-teal-400 opacity-30"></span>
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-xs">
                      {notif.secondsLeft}s
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">Demo Alarm Scheduled</p>
                    <p className="text-slate-300 text-xs">
                      <span className="text-teal-400 font-medium">{notif.medicineName}</span> ({notif.dosage}) in {notif.secondsLeft} seconds
                    </p>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-teal-400 animate-pulse shrink-0 ml-2" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Modal Pop-up for Notification Trigger */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 relative">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

              <button
                onClick={dismissPopup}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start space-x-4 pt-2">
                <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-600 ring-8 ring-teal-50/50 shrink-0">
                  <Bell className="w-7 h-7 animate-bounce" />
                </div>

                <div className="flex-1 pr-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Demo Alarm Triggered (10s Lag)</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Time for your Medicine!
                  </h3>

                  <p className="mt-1 text-slate-600 text-sm">
                    Please take your prescribed dose of{' '}
                    <span className="font-bold text-teal-700">{activePopup.medicineName}</span>.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-medium">Dosage</span>
                      <span className="font-semibold text-slate-800">{activePopup.dosage}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-medium">Scheduled</span>
                      <span className="font-semibold text-teal-600">{activePopup.timeLabel}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      onClick={() => {
                        if (onMarkTakenHandler) {
                          onMarkTakenHandler(activePopup.medicineName);
                        }
                        dismissPopup();
                      }}
                      className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Taken</span>
                    </button>

                    <button
                      onClick={dismissPopup}
                      className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors active:scale-95"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
