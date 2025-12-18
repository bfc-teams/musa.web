import React, { useState, useEffect } from 'react';
import CardDataStats from '../components/CardDataStats';
import { Eye, ShoppingCart, ShoppingBag, Users, DollarSign, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatUtils';
import api from '@/services/api';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@/components/theme-provider';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [chartData, setChartData] = useState([]);
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
    try {
      const res = await api.get(`/reports/dashboard?month=${month}&year=${year}`);
      if (res.data) {
        setStats(res.data.kpis);
        processChartData(res.data.chartData);
        setTopOrders(res.data.topOrders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    const employees = [...new Set(data.map(d => d.employee_name || 'Sin Asignar'))];
    const services = [...new Set(data.map(d => d.service_name))];

    const newSeries = services.map(service => {
      return {
        name: service,
        data: employees.map(emp => {
          const item = data.find(d => (d.employee_name || 'Sin Asignar') === emp && d.service_name === service);
          return item ? parseFloat(item.company_profit).toFixed(2) : 0;
        })
      };
    });

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
      foreColor: isDarkMode ? '#CBD5E1' : '#64748B', // Adjust text color based on theme
    },
    grid: {
      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: '25%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
      title: { text: 'Empleados' },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { text: 'Ganancia (Bs.)' }
    },
    legend: { position: 'top', horizontalAlign: 'left', offsetX: 40 },
    fill: { opacity: 1 },
    colors: ['#3C50E0', '#80CAEE', '#8099EC', '#ADC1F4', '#FF5733', '#C70039', '#900C3F'],
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light' // Also adjust tooltip theme
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Ventas" total={formatCurrency(stats.totalSales)} rate="" levelUp>
          <DollarSign className="text-primary dark:text-white" size={22} />
        </CardDataStats>
        <CardDataStats title="Total Compras" total={formatCurrency(stats.totalPurchases)} rate="" levelDown>
          <ShoppingCart className="text-primary dark:text-white" size={22} />
        </CardDataStats>
        <CardDataStats title="Total Productos" total={stats.totalProducts} rate="" levelUp>
          <Package className="text-primary dark:text-white" size={22} />
        </CardDataStats>
        <CardDataStats title="Total Clientes" total={stats.totalCustomers} rate="" levelUp>
          <Users className="text-primary dark:text-white" size={22} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Ganancia de Empresa por Empleado y Servicio
            </h3>
            <div className="flex gap-2">
              <select
                className="rounded border border-stroke bg-transparent py-1 px-2 outline-none dark:border-strokedark"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</option>
                ))}
              </select>
              <select
                className="rounded border border-stroke bg-transparent py-1 px-2 outline-none dark:border-strokedark"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-2">
            <div id="chartThree" className="mx-auto flex justify-center">
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="bar"
                height={350}
                width={"100%"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
            Top 10 Ordenes de Mayor Costo
          </h3>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Orden ID
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Cliente
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Fecha
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {topOrders.map((order, key) => (
                  <tr key={key}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {order.code || `#${order.id}`}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {order.customer_name || order.Customer?.name || 'Cliente General'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {formatDate(order.date)}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-meta-3 font-medium">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

