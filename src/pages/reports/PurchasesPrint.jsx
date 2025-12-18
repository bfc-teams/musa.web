import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/formatUtils';

export const PurchasesPrint = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('printData_purchases');
    if (storedData) {
      setReportData(JSON.parse(storedData));
    }

    const handlePrint = () => {
      window.print();
    };

    setTimeout(handlePrint, 500);

  }, []);

  if (!reportData) return <div>Cargando datos...</div>;

  const { data, dateRange } = reportData;
  const { startDate, endDate } = dateRange;

  const calculateTotalCost = () => {
    return data.reduce((acc, curr) => acc + (Number(curr.total_cost) || 0), 0);
  };

  return (
    <div className="p-8 bg-white text-black">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">MUSA - Beauty Studio</h1>
        <h2 className="text-xl font-semibold mt-2">Reporte de Compras</h2>
        <p className="text-sm text-gray-600 mt-1">Periodo: {startDate} - {endDate}</p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Fecha</th>
            <th className="border border-gray-300 p-2 text-left">Proveedor</th>
            <th className="border border-gray-300 p-2 text-left">Factura</th>
            <th className="border border-gray-300 p-2 text-left">Almacén</th>
            <th className="border border-gray-300 p-2 text-right">Total Costo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="border border-gray-300 p-2">
                  {item.date ? formatDate(item.date) : '-'}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.Supplier?.name || '-'}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.invoice_number || '-'}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.Warehouse?.name || '-'}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ${Number(item.total_cost).toFixed(2)}
                </td>
              </tr>
              {reportData.includeDetails && item.PurchaseItems && item.PurchaseItems.length > 0 && (
                <tr>
                  <td colSpan="5" className="bg-gray-50 border border-gray-300 p-2 pl-8">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left font-semibold text-gray-500">Producto</th>
                          <th className="text-center font-semibold text-gray-500">Cantidad</th>
                          <th className="text-right font-semibold text-gray-500">Costo Unitario</th>
                          <th className="text-right font-semibold text-gray-500">Total Línea</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.PurchaseItems.map((detail, idx) => (
                          <tr key={idx}>
                            <td className="py-1">
                              {detail.Product ? detail.Product.name : 'Item Eliminado'}
                            </td>
                            <td className="text-center py-1">{detail.quantity}</td>
                            <td className="text-right py-1">${Number(detail.unit_cost).toFixed(2)}</td>
                            <td className="text-right py-1">${Number(detail.total_cost).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          <tr className="font-bold bg-gray-50">
            <td colSpan="4" className="border border-gray-300 p-2 text-right">TOTAL COMPRAS</td>
            <td className="border border-gray-300 p-2 text-right">
              ${calculateTotalCost().toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-8 text-xs text-center text-gray-500">
        <p>Generado el {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};
