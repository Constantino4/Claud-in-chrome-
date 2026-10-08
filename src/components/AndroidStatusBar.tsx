import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, SignalHigh } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-7 w-full bg-slate-950 text-slate-400 px-4 flex items-center justify-between text-[11px] font-semibold tracking-tight select-none border-b border-slate-900/60 z-30">
      <div className="flex items-center gap-1.5 text-slate-300">
        <span>{timeStr}</span>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-[10px] font-bold text-cyan-400 tracking-wider">5G</span>
        <SignalHigh className="w-3 h-3 text-slate-300" />
        <Wifi className="w-3 h-3 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px]">85%</span>
          <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
