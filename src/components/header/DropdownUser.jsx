import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      ) {
        return;
      }

      setDropdownOpen(false);
    };

    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };

    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 rounded-2xl border border-transparent px-2 py-1.5 transition hover:border-slate-200 hover:bg-white/70 dark:hover:border-strokedark dark:hover:bg-boxdark"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
            {user?.name || user?.username || 'Admin User'}
          </span>
          <span className="block text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-bodydark2">
            {user?.role || 'Usuario'}
          </span>
        </span>

        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
          <User className="h-5 w-5" />
        </span>

        <ChevronDown className={`hidden text-slate-400 transition sm:block ${dropdownOpen ? 'rotate-180' : ''}`} size={18} />
      </Link>

      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-3 flex w-64 flex-col rounded-2xl border border-white/70 bg-white/95 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)] backdrop-blur dark:border-strokedark dark:bg-boxdark/95 ${dropdownOpen === true ? 'block' : 'hidden'
          }`}
      >
        <ul className="flex flex-col gap-4 border-b border-stroke px-5 py-5 dark:border-strokedark">
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-primary dark:text-bodydark1 lg:text-base"
            >
              <User className="h-5 w-5" />
              Mi perfil
            </Link>
          </li>
          <li>
            <Link
              to="#"
              className="flex items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-primary dark:text-bodydark1 lg:text-base"
            >
              <Settings className="h-5 w-5" />
              Configuracion
            </Link>
          </li>
        </ul>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-slate-700 transition hover:text-primary dark:text-bodydark1 lg:text-base"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesion
        </button>
      </div>
    </div>
  );
};

export default DropdownUser;
