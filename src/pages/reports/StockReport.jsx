import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { InputGroup } from '@/components/ui/FormElements';

import { exportToExcel } from '@/utils/exportUtils';
import { formatCurrency } from '@/utils/formatUtils';

export const StockReport = () => {
  const { register, watch } = useForm({
    defaultValues: {
      warehouse_id: '',
      product_name: ''
    }
  });

  const warehouseId = watch('warehouse_id');
  const productName = watch('product_name'); // Debounce this?

  const [reportData, setReportData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simple debounce for search
  const [debouncedSearch, setDebouncedSearch] = useState(productName);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(productName);
    }, 800);
    return () => clearTimeout(handler);
  }, [productName]);


  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data || []);
    } catch (error) {
      console.error("Error fetching warehouses", error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (warehouseId) params.warehouse_id = warehouseId;
      if (debouncedSearch) params.product_name = debouncedSearch;

      const response = await api.get('/reports/stock', { params });
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [warehouseId, debouncedSearch]);

  const calculateTotalValue = () => {
    // Approx calculation: quantity * (Product.sale_price or cost_price? Usually cost for inventory value)
    // Let's assume Product model has cost_price.
    return reportData.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.Product?.cost_price || 0)), 0);
  };

  const handlePrint = () => {
    localStorage.setItem('printData_stock', JSON.stringify({
      data: reportData,
    }));
    window.open('/print/stock', '_blank');
  };

  const handleExportExcel = () => {
    // Flatten data for Excel
    const flatData = reportData.map(item => ({
      product: item.Product?.name || 'Producto Desconocido',
      lot: item.lot_number || '',
      warehouse: item.Warehouse?.name || '',
      quantity: item.quantity,
      cost: Number(item.Product?.cost_price || 0),
      total_value: Number(item.quantity) * Number(item.Product?.cost_price || 0)
    }));

    const headers = {
      product: 'Producto',
      lot: 'Lote',
      warehouse: 'Almacén',
      quantity: 'Cantidad',
      cost: 'Costo Unit.',
      total_value: 'Valor Total'
    };
    exportToExcel(flatData, headers, `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Reporte de Inventario (Stock)
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
            label="Buscar Producto"
            name="product_name"
            placeholder="Nombre del producto..."
            register={register}
          />
          <div className="mb-4">
            <label className="mb-2.5 block text-black dark:text-white">
              Almacén
            </label>
            <div className="relative z-20 bg-transparent dark:bg-form-input">
              <select
                {...register('warehouse_id')}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Todos los Almacenes</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5 border-b border-stroke dark:border-strokedark flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Resultados
          </h4>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Producto
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Almacén
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Cantidad
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Costo Unit.
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Valor Total
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
                  <td colSpan="5" className="py-5 px-4 text-center">No se encontraron productos.</td>
                </tr>
              ) : (
                <>
                  {reportData.map((item, key) => {
                    const costPrice = Number(item.Product?.cost_price || 0);
                    const quantity = Number(item.quantity);
                    const totalVal = costPrice * quantity;

                    return (
                      <tr key={key} className="border-b border-stroke dark:border-strokedark pl-4">
                        <td className="py-5 px-4 pl-9 xl:pl-11">
                          <div className="flex flex-col">
                            <p className="text-black dark:text-white font-medium">
                              {item.Product?.name || 'Producto Desconocido'}
                            </p>
                            {item.lot_number && (
                              <span className="text-xs text-gray-500">Lote: {item.lot_number}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.Warehouse?.name || '-'}
                          </p>
                        </td>
                        <td className="py-5 px-4 dark:border-strokedark">
                          <p className={`font-medium ${quantity <= 5 ? 'text-meta-1' : 'text-black dark:text-white'}`}>
                            {quantity}
                          </p>
                        </td>
                        <td className="py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {formatCurrency(costPrice)}
                          </p>
                        </td>
                        <td className="py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {formatCurrency(totalVal)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 dark:bg-meta-4 font-bold border-t-2 border-stroke dark:border-strokedark">
                    <td colSpan="4" className="py-5 px-4 text-right">
                      VALOR TOTAL INVENTARIO (Estimado Costo)
                    </td>
                    <td className="py-5 px-4 text-black dark:text-white">
                      ${calculateTotalValue().toFixed(2)}
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
