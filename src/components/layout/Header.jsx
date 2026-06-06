import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import DarkModeSwitcher from '../header/DarkModeSwitcher';
import DropdownNotification from '../header/DropdownNotification';
import DropdownUser from '../header/DropdownUser';

export function Header({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const routeSegmentLabels = {
    login: 'Inicio de sesion',
    employees: 'Empleados',
    products: 'Productos',
    services: 'Servicios',
    'service-orders': 'Ordenes de servicio',
    customers: 'Clientes',
    users: 'Usuarios',
    inventory: 'Inventario',
    warehouses: 'Almacenes',
    suppliers: 'Proveedores',
    purchases: 'Compras',
    transfers: 'Transferencias',
    stock: 'Stock',
    sales: 'Ventas',
    reports: 'Reportes',
    print: 'Impresion',
    'employee-performance': 'Rendimiento de empleados',
    new: 'Nuevo',
    edit: 'Editar',
  };

  const pathLabel = location.pathname === '/'
    ? 'Panel general'
    : location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => routeSegmentLabels[segment] || segment.replace(/-/g, ' '))
      .join(' / ');

  const today = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-999 flex w-full border-b border-white/60 bg-white/70 backdrop-blur-xl dark:border-strokedark dark:bg-boxdark-2/75">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-10">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link className="block flex-shrink-0 lg:hidden" to="/">
            <span className="text-lg font-semibold tracking-[0.2em] text-slate-900 dark:text-white">MUSA</span>
          </Link>
        </div>

        <div className="hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-bodydark2">
            {today}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
            {pathLabel}
          </h1>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
            <DropdownNotification />
          </ul>

          <DropdownUser />
        </div>
      </div>
    </header>
  );
}
