import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';

import { exportToExcel } from '@/utils/exportUtils';
import { formatCurrency, formatDate } from '@/utils/formatUtils';

export const PurchasesReport = () => {
  const { register, watch } = useForm({
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      supplier_id: '',
      includeDetails: false
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const supplierId = watch('supplier_id');
  const includeDetails = watch('includeDetails');
  const [reportData, setReportData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers", error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { start_date: startDate, end_date: endDate, includeDetails };
      if (supplierId) params.supplier_id = supplierId;

      const response = await api.get('/reports/purchases', { params });
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
  }, [startDate, endDate, supplierId, includeDetails]);

  const calculateTotalCost = () => {
    return reportData.reduce((acc, curr) => acc + (Number(curr.total_cost) || 0), 0);
  };

  const handlePrint = () => {
    localStorage.setItem('printData_purchases', JSON.stringify({
      data: reportData,
      dateRange: { startDate, endDate },
      includeDetails
    }));
    window.open('/print/purchases', '_blank');
  };

  const handleExportExcel = () => {
    let exportData = [];
    let headers = {};

    if (includeDetails) {
      reportData.forEach(purchase => {
        if (purchase.PurchaseItems && purchase.PurchaseItems.length > 0) {
          purchase.PurchaseItems.forEach(item => {
            exportData.push({
              date: purchase.date ? formatDate(purchase.date) : '-',
              supplier: purchase.Supplier ? purchase.Supplier.name : '-',
              invoice: purchase.invoice_number,
              warehouse: purchase.Warehouse ? purchase.Warehouse.name : '-',
              product: item.Product ? item.Product.name : 'Item Eliminado',
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              total_cost_line: item.total_cost,
              purchase_total: purchase.total_cost
            });
          });
        } else {
          exportData.push({
            date: purchase.date ? formatDate(purchase.date) : '-',
            supplier: purchase.Supplier ? purchase.Supplier.name : '-',
            invoice: purchase.invoice_number,
            warehouse: purchase.Warehouse ? purchase.Warehouse.name : '-',
            product: 'Sin Detalle',
            quantity: 0,
            unit_cost: 0,
            total_cost_line: 0,
            purchase_total: purchase.total_cost
          });
        }
      });

      headers = {
        date: 'Fecha',
        supplier: 'Proveedor',
        invoice: 'Factura',
        warehouse: 'Almacén',
        product: 'Producto',
        quantity: 'Cantidad',
        unit_cost: 'Costo Unitario',
        total_cost_line: 'Total Línea',
        purchase_total: 'Total Compra'
      };

    } else {
      exportData = reportData;
      headers = {
        date: 'Fecha',
        'Supplier.name': 'Proveedor',
        invoice_number: 'Nº Factura',
        'Warehouse.name': 'Almacén',
        total_cost: 'Total Costo'
      };
    }

    exportToExcel(exportData, headers, `Reporte_Compras_${startDate}_${endDate}${includeDetails ? '_Detallado' : ''}.xlsx`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Reporte de Compras
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
              Proveedor
            </label>
            <div className="relative z-20 bg-transparent dark:bg-form-input">
              <select
                {...register('supplier_id')}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Todos los Proveedores</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
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
                  Proveedor
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Factura
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Almacén
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Total Costo
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
                          {item.Supplier?.name || '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.invoice_number || '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.Warehouse?.name || '-'}
                        </p>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <p className="text-meta-1 font-medium">
                          {formatCurrency(item.total_cost)}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 dark:bg-meta-4 font-bold border-t-2 border-stroke dark:border-strokedark">
                    <td colSpan="4" className="py-5 px-4 text-right">
                      TOTALES
                    </td>
                    <td className="py-5 px-4 text-meta-1">
                      Bs. {calculateTotalCost().toFixed(2)}
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
