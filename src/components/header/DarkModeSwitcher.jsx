import React from 'react';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

const DarkModeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <label
      className={`relative m-0 block h-10 w-[4.5rem] rounded-full border p-1 transition-colors ${theme === 'dark' ? 'border-white/10 bg-slate-800' : 'border-slate-200 bg-white'
        }`}
    >
      <input
        type="checkbox"
        onChange={() => {
          if (theme === 'dark') {
            setTheme('light');
          } else {
            setTheme('dark');
          }
        }}
        className="absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
      />
      <span
        className={`absolute top-1/2 left-1 flex h-8 w-8 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-primary text-white shadow-sm duration-200 ease-linear ${theme === 'dark' ? '!translate-x-[2.15rem] bg-slate-100 text-slate-900' : ''
          }`}
      >
        {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </label>
  );
};

export default DarkModeSwitcher;
