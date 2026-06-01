import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, ArrowLeft, ChevronDown, Package, Scissors, ShoppingCart, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import SidebarLinkGroup from './SidebarLinkGroup';

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: 'Inicio',
    route: '/',
    permission: 'menu:dashboard',
  },
  { icon: Users, label: 'Empleados', route: '/employees', permission: 'menu:employees' },
  { icon: Users, label: 'Clientes', route: '/customers', permission: 'menu:customers' },
  { icon: Users, label: 'Usuarios', route: '/users', permission: 'menu:users' },
  {
    icon: Package,
    label: 'Inventario',
    route: '/inventory',
    permission: 'menu:inventory',
    children: [
      { label: 'Almacenes', route: '/inventory/warehouses', permission: 'menu:warehouses' },
      { label: 'Proveedores', route: '/inventory/suppliers', permission: 'menu:suppliers' },
      { label: 'Productos', route: '/products', permission: 'menu:products' },
      { label: 'Stock global', route: '/inventory/stock', permission: 'menu:stock' },
      { label: 'Transferir stock', route: '/inventory/transfers/new', permission: 'menu:stock_transfers' },
    ],
  },
  { icon: ShoppingBag, label: 'Compras', route: '/inventory/purchases', permission: 'menu:purchases' },
  { icon: ShoppingCart, label: 'Ventas', route: '/sales', permission: 'menu:sales' },
  {
    icon: Scissors,
    label: 'Servicios',
    route: '/services',
    permission: 'menu:services',
    children: [
      { label: 'Catalogo de servicios', route: '/services', permission: 'menu:service_catalog' },
      { label: 'Ordenes de servicio', route: '/service-orders', permission: 'menu:service_orders' },
    ],
  },
  {
    icon: FileText,
    label: 'Reportes',
    route: '/reports',
    permission: 'menu:reports',
    children: [
      { label: 'Rendimiento empleados', route: '/reports/employee-performance', permission: 'report:employee_performance' },
      { label: 'Ventas', route: '/reports/sales', permission: 'report:sales' },
      { label: 'Compras', route: '/reports/purchases', permission: 'report:purchases' },
      { label: 'Servicios', route: '/reports/services', permission: 'report:services' },
      { label: 'Inventario', route: '/reports/stock', permission: 'report:stock' },
    ],
  },
  { icon: Settings, label: 'Configuracion', route: '/settings', permission: 'menu:users' },
];

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const { user, logout } = useAuthStore();

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  const filteredSidebarItems = sidebarItems.filter((item) => {
    const userPermissions = user?.permissions || [];

    if (!item.permission) return true;

    return userPermissions.includes(item.permission);
  });

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      ) {
        return;
      }

      setSidebarOpen(false);
    };

    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };

    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-white/10 bg-slate-950 text-slate-200 duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center justify-between gap-2">
          <NavLink to="/" className="text-2xl font-semibold tracking-[0.24em] text-white">
            MUSA
          </NavLink>

          <button
            ref={trigger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Sesion activa
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {user?.name || user?.username || 'Equipo Musa'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {user?.role || 'Usuario'}
          </p>
        </div>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 py-5 duration-300 ease-linear">
        <nav className="space-y-6">
          <div>
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Navegacion
            </h3>

            <ul className="flex flex-col gap-1.5">
              {filteredSidebarItems.map((item, index) => {
                const Icon = item.icon;

                if (item.children) {
                  return (
                    <SidebarLinkGroup
                      key={index}
                      activeCondition={pathname === item.route || pathname.includes(item.route)}
                    >
                      {(handleClick, open) => {
                        const isActive = pathname === item.route || pathname.includes(item.route);

                        return (
                          <React.Fragment>
                            <NavLink
                              to="#"
                              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                }`}
                              onClick={(e) => {
                                e.preventDefault();
                                sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                              }}
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                              <ChevronDown
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${open ? 'rotate-180' : ''}`}
                                size={18}
                              />
                            </NavLink>

                            <div className={`overflow-hidden ${!open ? 'hidden' : ''}`}>
                              <ul className="mt-2 flex flex-col gap-1 pl-4">
                                {item.children.map((child, childIndex) => (
                                  <li key={childIndex}>
                                    <NavLink
                                      to={child.route}
                                      className={({ isActive }) =>
                                        `group flex items-center rounded-xl px-4 py-2.5 text-sm transition ${isActive
                                          ? 'bg-white/10 text-white'
                                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                          }`
                                      }
                                    >
                                      {child.label}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </React.Fragment>
                        );
                      }}
                    </SidebarLinkGroup>
                  );
                }

                return (
                  <li key={item.route}>
                    <NavLink
                      to={item.route}
                      className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${pathname === item.route
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="pt-2">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Cuenta
            </h3>

            <ul className="flex flex-col gap-1.5">
              <li>
                <button
                  onClick={logout}
                  className="group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesion
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
