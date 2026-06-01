import React, { useEffect, useState } from 'react';
import { ShoppingCart, Users, DollarSign, Package, Sparkles } from 'lucide-react';
import ReactApexChart from 'react-apexcharts';
import CardDataStats from '../components/CardDataStats';
import { formatCurrency, formatDate } from '@/utils/formatUtils';
import api from '@/services/api';
import { useTheme } from '@/components/theme-provider';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topOrders, setTopOrders] = useState([]);

  useEffect(() => {
    fetchStats();
  }, [month, year]);

  const fetchStats = async () => {
    setLoading(true);

    try {
      const res = await api.get(`/reports/dashboard?month=${month}&year=${year}`);
      if (res.data) {
        setStats(res.data.kpis);
        processChartData(res.data.chartData || []);
        setTopOrders(res.data.topOrders || []);
      }
    } catch (err) {
      console.error(err);
      setSeries([]);
      setCategories([]);
      setTopOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    const employees = [...new Set(data.map((item) => item.employee_name || 'Sin asignar'))];
    const services = [...new Set(data.map((item) => item.service_name))];

    const newSeries = services.map((service) => ({
      name: service,
      data: employees.map((employee) => {
        const item = data.find(
          (entry) => (entry.employee_name || 'Sin asignar') === employee && entry.service_name === service
        );

        return item ? Number(parseFloat(item.company_profit).toFixed(2)) : 0;
      }),
    }));

    setCategories(employees);
    setSeries(newSeries);
  };

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: isDarkMode ? '#CBD5E1' : '#64748B',
    },
    grid: {
      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '30%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      title: { text: 'Empleados' },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'Ganancia (Bs.)' },
    },
    legend: { position: 'top', horizontalAlign: 'left' },
    fill: { opacity: 1 },
    colors: ['#3C50E0', '#80CAEE', '#8099EC', '#ADC1F4', '#FF7A59', '#D7263D', '#0F8B8D'],
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
    },
  };

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 px-6 py-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-strokedark dark:bg-boxdark/85 md:px-7 md:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Resumen del negocio
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Un panel mas claro para tomar decisiones rapido
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-bodydark1">
              Visualiza ventas, compras, clientes y rendimiento del equipo en un solo lugar, con menos ruido visual y mejor jerarquia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {[2023, 2024, 2025, 2026].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Ventas" total={formatCurrency(stats.totalSales)} rate="" levelUp>
          <DollarSign size={22} />
        </CardDataStats>
        <CardDataStats title="Total Compras" total={formatCurrency(stats.totalPurchases)} rate="" levelDown>
          <ShoppingCart size={22} />
        </CardDataStats>
        <CardDataStats title="Total Productos" total={stats.totalProducts} rate="" levelUp>
          <Package size={22} />
        </CardDataStats>
        <CardDataStats title="Total Clientes" total={stats.totalCustomers} rate="" levelUp>
          <Users size={22} />
        </CardDataStats>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 rounded-[2rem] border border-white/70 bg-white/90 px-5 pb-5 pt-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-strokedark dark:bg-boxdark/85 sm:px-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Ganancia por empleado y servicio
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-bodydark1">
                Compara facilmente el aporte de cada servicio dentro del periodo seleccionado.
              </p>
            </div>
            {loading && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-bodydark2">
                Cargando
              </span>
            )}
          </div>

          <div id="chartThree" className="mx-auto flex justify-center">
            {series.length === 0 && !loading ? (
              <div className="flex h-[350px] w-full items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-strokedark dark:text-bodydark2">
                No hay datos disponibles para este periodo.
              </div>
            ) : (
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="bar"
                height={350}
                width="100%"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 rounded-[2rem] border border-white/70 bg-white/90 px-5 pb-5 pt-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-strokedark dark:bg-boxdark/85 sm:px-7">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Top 10 ordenes de mayor costo
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-bodydark1">
              Identifica rapidamente las ordenes con mayor valor y a que clientes pertenecen.
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50 text-left dark:bg-white/5">
                  <th className="min-w-[150px] px-4 py-4 text-sm font-semibold text-slate-500 dark:text-white xl:pl-11">
                    Orden ID
                  </th>
                  <th className="min-w-[150px] px-4 py-4 text-sm font-semibold text-slate-500 dark:text-white">
                    Cliente
                  </th>
                  <th className="min-w-[120px] px-4 py-4 text-sm font-semibold text-slate-500 dark:text-white">
                    Fecha
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500 dark:text-white">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {topOrders.map((order, key) => (
                  <tr key={key}>
                    <td className="border-b border-slate-100 px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-slate-900 dark:text-white">
                        {order.code || `#${order.id}`}
                      </h5>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-5 dark:border-strokedark">
                      <p className="text-slate-700 dark:text-white">
                        {order.customer_name || order.Customer?.name || 'Cliente general'}
                      </p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-5 dark:border-strokedark">
                      <p className="text-slate-700 dark:text-white">
                        {formatDate(order.date)}
                      </p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-5 dark:border-strokedark">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-300">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </td>
                  </tr>
                ))}
                {topOrders.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-400 dark:text-bodydark2">
                      No se encontraron ordenes destacadas para este periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
