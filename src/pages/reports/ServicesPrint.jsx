import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/formatUtils';

export const ServicesPrint = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('printData_services');
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

  const calculateTotal = () => {
    return data.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  };

  return (
    <div className="p-8 bg-white text-black">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mt-2">Reporte de Servicios</h2>
        <p className="text-sm text-gray-600 mt-1">Periodo: {startDate} - {endDate}</p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Fecha</th>
            <th className="border border-gray-300 p-2 text-left">Orden</th>
            <th className="border border-gray-300 p-2 text-left">Servicio</th>
            <th className="border border-gray-300 p-2 text-left">Empleado</th>
            <th className="border border-gray-300 p-2 text-right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">
                {item.Order?.date ? formatDate(item.Order.date) : '-'}
              </td>
              <td className="border border-gray-300 p-2">
                {item.Order?.code || '-'}
              </td>
              <td className="border border-gray-300 p-2">
                {item.Service?.name || `Servicio #${item.service_id}`}
              </td>
              <td className="border border-gray-300 p-2">
                {item.Employee?.name || 'Sin Asignar'}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                ${Number(item.price).toFixed(2)}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td colSpan="4" className="border border-gray-300 p-2 text-right">TOTAL</td>
            <td className="border border-gray-300 p-2 text-right">
              ${calculateTotal().toFixed(2)}
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
