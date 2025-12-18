import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { format } from 'date-fns';
import { InputGroup } from '@/components/ui/FormElements';
import { Search } from 'lucide-react';

import { exportToExcel } from '@/utils/exportUtils';
import { formatCurrency, formatDate } from '@/utils/formatUtils';

export const SalesReport = () => {
  const { register, watch } = useForm({
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
      endDate: new Date().toISOString().split('T')[0], // Today
      includeDetails: false
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const includeDetails = watch('includeDetails');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/sales', {
        params: { start_date: startDate, end_date: endDate, includeDetails }
      });
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
  }, [startDate, endDate, includeDetails]);

  const calculateTotalSales = () => {
    return reportData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
  };

  const handlePrint = () => {
    localStorage.setItem('printData_sales', JSON.stringify({
      data: reportData,
      dateRange: { startDate, endDate },
      includeDetails
    }));
    window.open('/print/sales', '_blank');
  };

  const handleExportExcel = () => {
    let exportData = [];
    let headers = {};

    if (includeDetails) {
      // Flatten detailed data
      reportData.forEach(sale => {
        if (sale.SaleItems && sale.SaleItems.length > 0) {
          sale.SaleItems.forEach(item => {
            exportData.push({
              date: sale.date ? formatDate(sale.date) : '-',
              customer: sale.customer_name || 'Cliente General',
              payment_method: sale.payment_method,
              warehouse: sale.Warehouse?.name || '-',
              product: item.Product ? item.Product.name : (item.Service ? item.Service.name : 'Item'),
              sku: item.Product ? item.Product.sku : '-',
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.total_price,
              sale_total: sale.total_amount // Optional: include parent total for reference
            });
          });
        } else {
          // Sale with no items?
          exportData.push({
            date: sale.date ? formatDate(sale.date) : '-',
            customer: sale.customer_name || 'Cliente General',
            payment_method: sale.payment_method,
            warehouse: sale.Warehouse?.name || '-',
            product: 'Sin Detalle',
            sku: '-',
            quantity: 0,
            unit_price: 0,
            total_price: 0,
            sale_total: sale.total_amount
          });
        }
      });

      headers = {
        date: 'Fecha',
        customer: 'Cliente',
        payment_method: 'Método Pago',
        warehouse: 'Almacén',
        product: 'Producto/Servicio',
        sku: 'SKU',
        quantity: 'Cantidad',
        unit_price: 'Precio Unitario',
        total_price: 'Total Línea',
        sale_total: 'Total Venta'
      };

    } else {
      // Summary data
      exportData = reportData;
      headers = {
        date: 'Fecha',
        customer_name: 'Cliente',
        payment_method: 'Método Pago',
        'Warehouse.name': 'Almacén',
        total_amount: 'Total'
      };
    }

    exportToExcel(exportData, headers, `Reporte_Ventas_${startDate}_${endDate}${includeDetails ? '_Detallado' : ''}.xlsx`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Reporte de Ventas
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('includeDetails')}
              className="form-checkbox h-5 w-5 text-primary"
            />
            <span className="text-black dark:text-white">
              Incluir detalle en Reporte (Excel y PDF)
            </span>
          </label>
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
                  Cliente
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Método Pago
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Almacén
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Total
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
                          {item.date ? formatDate(item.date) : '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.customer_name || 'Cliente General'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white capitalize">
                          {item.payment_method}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Warehouse?.name || '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-success font-medium">
                          {formatCurrency(item.total_amount)}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 dark:bg-meta-4 font-bold border-t-2 border-stroke dark:border-strokedark">
                    <td colSpan="4" className="py-5 px-4 text-right">
                      TOTALES
                    </td>
                    <td className="py-5 px-4 text-success">
                      {formatCurrency(calculateTotalSales())}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
