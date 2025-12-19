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
      { label: 'Stock Global', route: '/inventory/stock', permission: 'menu:stock' },
      { label: 'Transferir Stock', route: '/inventory/transfers/new', permission: 'menu:stock_transfers' },
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
      { label: 'Catálogo de Servicios', route: '/services', permission: 'menu:service_catalog' },
      { label: 'Órdenes de Servicio', route: '/service-orders', permission: 'menu:service_orders' },
    ],
  },
  {
    icon: FileText,
    label: 'Reportes',
    route: '/reports',
    permission: 'menu:reports',
    children: [
      { label: 'Rendimiento Empleados', route: '/reports/employee-performance', permission: 'report:employee_performance' },
      { label: 'Ventas', route: '/reports/sales', permission: 'report:sales' },
      { label: 'Compras', route: '/reports/purchases', permission: 'report:purchases' },
      { label: 'Servicios', route: '/reports/services', permission: 'report:services' },
      { label: 'Inventario', route: '/reports/stock', permission: 'report:stock' },
    ],
  },
  { icon: Settings, label: 'Configuración', route: '/settings', permission: 'menu:users' },
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

  // Filter sidebar items based on permissions
  const filteredSidebarItems = sidebarItems.filter((item) => {
    // If no user or no permissions, show nothing or only dashboard? 
    // Assuming backend sends permissions. If not, default to empty array.
    const userPermissions = user?.permissions || [];

    // If item has no permission defined, show it (or hide? User said strictly enable options).
    // Let's assume generic items are visible, but our mapped items are restricted.
    if (!item.permission) return true;

    return userPermissions.includes(item.permission);
  });

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
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
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/" className="text-2xl font-bold text-white">
          Musa Salon
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENÚ
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {filteredSidebarItems.map((item, index) => {
                const Icon = item.icon;

                if (item.children) {
                  return (
                    <SidebarLinkGroup
                      key={index}
                      activeCondition={
                        pathname === item.route || pathname.includes(item.route)
                      }
                    >
                      {(handleClick, open) => {
                        return (
                          <React.Fragment>
                            <NavLink
                              to="#"
                              className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === item.route || pathname.includes(item.route)) &&
                                'bg-graydark dark:bg-meta-4'
                                }`}
                              onClick={(e) => {
                                e.preventDefault();
                                sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                              }}
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                              <ChevronDown
                                className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'
                                  }`}
                                size={20}
                              />
                            </NavLink>
                            {/* <!-- Dropdown Menu Start --> */}
                            <div
                              className={`translate transform overflow-hidden ${!open && 'hidden'
                                }`}
                            >
                              <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                                {item.children.map((child, childIndex) => (
                                  <li key={childIndex}>
                                    <NavLink
                                      to={child.route}
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                        (isActive && '!text-white')
                                      }
                                    >
                                      {child.label}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {/* <!-- Dropdown Menu End --> */}
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
                      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === item.route && 'bg-graydark dark:bg-meta-4'
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

          {/* <!-- Others Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              OTROS
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <button
                  onClick={logout}
                  className="group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
}
