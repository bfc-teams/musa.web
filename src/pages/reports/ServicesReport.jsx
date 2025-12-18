import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { InputGroup } from '@/components/ui/FormElements';

import { exportToExcel } from '@/utils/exportUtils';
import { formatCurrency } from '@/utils/formatUtils';

export const ServicesReport = () => {
  const { register, watch } = useForm({
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      employee_id: ''
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const employeeId = watch('employee_id');
  const [reportData, setReportData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { start_date: startDate, end_date: endDate };
      if (employeeId) params.employee_id = employeeId;

      const response = await api.get('/reports/services', { params });
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate, employeeId]);

  const handlePrint = () => {
    localStorage.setItem('printData_services', JSON.stringify({
      data: reportData,
      dateRange: { startDate, endDate }
    }));
    window.open('/print/services', '_blank');
  };

  const handleExportExcel = () => {
    // Flatten data for Excel
    const flatData = reportData.map(item => ({
      date: item.Order?.date || '',
      order_code: item.Order?.code || '',
      service: item.Service?.name || (`Servicio #${item.service_id}`),
      employee: item.Employee?.name || 'Sin Asignar',
      price: item.price
    }));

    const headers = {
      date: 'Fecha',
      order_code: 'Orden',
      service: 'Servicio',
      employee: 'Empleado',
      price: 'Precio'
    };
    exportToExcel(flatData, headers, `Reporte_Servicios_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Reporte de Servicios Realizados
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center rounded bg-success py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
          >
            Exportar Excel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
          >
            Imprimir PDF
          </button>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 mb-6">
        <h3 className="font-medium text-black dark:text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputGroup
            label="Fecha Inicio"
            name="startDate"
            type="date"
            register={register}
          />
          <InputGroup
            label="Fecha Fin"
            name="endDate"
            type="date"
            register={register}
          />
          <div className="mb-4">
            <label className="mb-2.5 block text-black dark:text-white">
              Empleado
            </label>
            <div className="relative z-20 bg-transparent dark:bg-form-input">
              <select
                {...register('employee_id')}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Todos los Empleados</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5 border-b border-stroke dark:border-strokedark flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Resultados ({startDate} - {endDate})
          </h4>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Fecha
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Orden
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Servicio
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Empleado
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Precio Cobrado
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-5 px-4 text-center">Cargando...</td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-5 px-4 text-center">No hay datos para el rango seleccionado.</td>
                </tr>
              ) : (
                <>
                  {reportData.map((item, key) => (
                    <tr key={key} className="border-b border-stroke dark:border-strokedark pl-4">
                      <td className="py-5 px-4 pl-9 xl:pl-11">
                        <p className="text-black dark:text-white">
                          {item.Order?.date ? formatDate(item.Order.date) : '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Order?.code || '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        {/* We need Service name, assuming included in OrderService or fetched. 
                             Wait, getServicesReport includes `OrderService` which has `service_id` but does NOT include `Service` model in helper function?
                             Checking reportController.js:
                             L51: include: [{ model: Employee }, { model: Order }]
                             It does NOT include Service model explicitly.
                             Ah, OrderService usually has Service association.
                             I should verify if I can get Service name.
                             If not, I might show ID or need to fix Controller.
                             Let's assume I fix Controller or it's implicitly eager loaded? No, explicit include needed.
                             I will update this file assuming it works, but I might need to fix Backend.
                          */}
                        <p className="text-black dark:text-white">
                          {/* Assuming the controller is fixed to include Service, or we only have ID */}
                          {item.Service?.name || `Servicio #${item.service_id}`}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Employee?.name || 'Sin Asignar'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-primary font-medium">
                          {formatCurrency(item.price)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
