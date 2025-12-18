import React, { useEffect, useState } from 'react';

export const StockPrint = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('printData_stock');
    if (storedData) {
      setReportData(JSON.parse(storedData));
    }

    const handlePrint = () => {
      window.print();
    };

    setTimeout(handlePrint, 500);

  }, []);

  if (!reportData) return <div>Cargando datos...</div>;

  const { data } = reportData;

  const calculateTotalValue = () => {
    return data.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.Product?.cost_price || 0)), 0);
  };

  return (
    <div className="p-8 bg-white text-black">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">MUSA - Beauty Studio</h1>
        <h2 className="text-xl font-semibold mt-2">Reporte de Inventario</h2>
        <p className="text-sm text-gray-600 mt-1">Generado el: {new Date().toLocaleDateString()}</p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Producto</th>
            <th className="border border-gray-300 p-2 text-left">Lote</th>
            <th className="border border-gray-300 p-2 text-left">Almacén</th>
            <th className="border border-gray-300 p-2 text-right">Cantidad</th>
            <th className="border border-gray-300 p-2 text-right">Costo U.</th>
            <th className="border border-gray-300 p-2 text-right">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const costPrice = Number(item.Product?.cost_price || 0);
            const quantity = Number(item.quantity);
            const totalVal = costPrice * quantity;
            return (
              <tr key={index}>
                <td className="border border-gray-300 p-2">
                  {item.Product?.name || 'Producto Desconocido'}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.lot_number || '-'}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.Warehouse?.name || '-'}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {quantity}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ${costPrice.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ${totalVal.toFixed(2)}
                </td>
              </tr>
            );
          })}
          <tr className="font-bold bg-gray-50">
            <td colSpan="5" className="border border-gray-300 p-2 text-right">VALOR TOTAL INVENTARIO</td>
            <td className="border border-gray-300 p-2 text-right">
              ${calculateTotalValue().toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
