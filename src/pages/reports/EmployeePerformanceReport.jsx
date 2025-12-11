import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { format } from 'date-fns';
import { InputGroup } from '@/components/ui/FormElements';
import { Printer } from 'lucide-react';

export const EmployeePerformanceReport = () => {
  const { register, watch } = useForm({
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
      endDate: new Date().toISOString().split('T')[0], // Today
      reportType: 'summary'
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const reportType = watch('reportType');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate, reportType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/employee-performance', {
        params: {
          startDate,
          endDate,
          includeDetails: reportType === 'detailed'
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Save data to localStorage for the print window to consume
    localStorage.setItem('printData', JSON.stringify({
      data: reportData,
      period: { startDate, endDate }
    }));

    // Open the print view in a new tab/window
    window.open('/print/employee-performance', '_blank');
  };

  const calculateTotalCommission = () => {
    return reportData.reduce((acc, curr) => acc + (Number(curr.totalCommission) || 0), 0);
  };

  const calculateTotalSales = () => {
    return reportData.reduce((acc, curr) => acc + (Number(curr.totalSales) || 0), 0);
  };

  const calculateTotalCompanyProfit = () => {
    return reportData.reduce((acc, curr) => acc + (Number(curr.totalCompanyProfit) || 0), 0);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Reporte de Rendimiento de Empleados
        </h2>
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          <Printer className="h-5 w-5" />
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 mb-6 no-print">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Filtros
              </h3>
            </div>
            <div className="p-6.5 flex gap-4">
              <div className="w-1/2">
                <InputGroup
                  label="Fecha Inicio"
                  name="startDate"
                  type="date"
                  register={register}
                  required
                />
              </div>
              <div className="w-1/2">
                <InputGroup
                  label="Fecha Fin"
                  name="endDate"
                  type="date"
                  register={register}
                  required
                />
              </div>
            </div>

            <div className="p-6.5 pt-0 border-t border-stroke dark:border-strokedark mt-4">
              <label className="mb-3 block text-black dark:text-white pt-5">
                Tipo de Reporte (PDF Detallado)
              </label>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="summary"
                    value="summary"
                    {...register('reportType')}
                    className="cursor-pointer"
                  />
                  <label htmlFor="summary" className="cursor-pointer text-black dark:text-white">Resumen</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="detailed"
                    value="detailed"
                    {...register('reportType')}
                    className="cursor-pointer"
                  />
                  <label htmlFor="detailed" className="cursor-pointer text-black dark:text-white">Detallado (Incluir Servicios)</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Resultados ({startDate} - {endDate})
          </h3>
        </div>
        <div className="p-6.5">
          {loading ? (
            <div className="text-center">Cargando...</div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                      Empleado
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Rol
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Servicios Realizados
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Ventas Totales
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Ganancia Empleado
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Ganancia Empresa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, key) => (
                    <tr key={key} className="border-b border-[#eee] dark:border-strokedark">
                      <td className="py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.employeeName}
                        </h5>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">{item.employeeRole}</p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">{item.serviceCount}</p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          ${item.totalSales.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-success font-medium">
                          ${item.totalCommission.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-primary font-medium">
                          ${item.totalCompanyProfit?.toFixed(2) || '0.00'}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  {reportData.length > 0 && (
                    <tr className="bg-gray-100 dark:bg-meta-4 font-bold">
                      <td className="py-5 px-4 pl-9 xl:pl-11" colSpan="2">
                        TOTALES
                      </td>
                      <td className="py-5 px-4">
                        {reportData.reduce((acc, curr) => acc + curr.serviceCount, 0)}
                      </td>
                      <td className="py-5 px-4">
                        ${calculateTotalSales().toFixed(2)}
                      </td>
                      <td className="py-5 px-4 text-success">
                        ${calculateTotalCommission().toFixed(2)}
                      </td>
                      <td className="py-5 px-4 text-primary">
                        ${calculateTotalCompanyProfit().toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
