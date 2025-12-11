import React from 'react';
import { Document, Page } from '@htmldocs/react';

export const EmployeePerformancePDF = ({ data, startDate, endDate }) => {
  return (
    <Document>
      <Page>
        <div className="p-8 font-sans">
          <div className="mb-6 border-b border-gray-300 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Musa Salon</h1>
            <h2 className="text-lg text-gray-600 mt-1">Reporte de Rendimiento de Empleados</h2>
            <p className="text-sm text-gray-500 mt-2">
              Periodo: {startDate} - {endDate}
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="p-2 text-left text-xs font-bold text-gray-600">Empleado</th>
                <th className="p-2 text-left text-xs font-bold text-gray-600">Rol</th>
                <th className="p-2 text-center text-xs font-bold text-gray-600">Servicios</th>
                <th className="p-2 text-right text-xs font-bold text-gray-600">Ventas</th>
                <th className="p-2 text-right text-xs font-bold text-gray-600">G. Empleado</th>
                <th className="p-2 text-right text-xs font-bold text-gray-600">G. Empresa</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="border-b border-gray-100">
                    <td className="p-2 text-xs">{item.employeeName}</td>
                    <td className="p-2 text-xs">{item.employeeRole}</td>
                    <td className="p-2 text-center text-xs">{item.serviceCount}</td>
                    <td className="p-2 text-right text-xs">${item.totalSales.toFixed(2)}</td>
                    <td className="p-2 text-right text-xs text-green-600">${item.totalCommission.toFixed(2)}</td>
                    <td className="p-2 text-right text-xs text-blue-600">${item.totalCompanyProfit?.toFixed(2) || '0.00'}</td>
                  </tr>
                  {/* Detailed View - Sub-table */}
                  {item.services && item.services.length > 0 && (
                    <tr>
                      <td colSpan="6" className="px-8 py-2 bg-gray-50 border-b border-gray-200">
                        <table className="w-full mb-2">
                          <thead>
                            <tr>
                              <th className="text-[10px] text-gray-500 text-left w-1/3">Servicio</th>
                              <th className="text-[10px] text-gray-500 text-left">Fecha</th>
                              <th className="text-[10px] text-gray-500 text-right">Precio</th>
                              <th className="text-[10px] text-gray-500 text-right">Comisión</th>
                              <th className="text-[10px] text-gray-500 text-right">G. Empresa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.services.map((svc, idx) => (
                              <tr key={idx} className="border-b border-gray-100 last:border-0">
                                <td className="text-[10px] text-gray-600 py-1">{svc.serviceName}</td>
                                <td className="text-[10px] text-gray-600 py-1">{svc.date ? svc.date.split('T')[0] : '-'}</td>
                                <td className="text-[10px] text-gray-600 py-1 text-right">${svc.price.toFixed(2)}</td>
                                <td className="text-[10px] text-green-600 py-1 text-right">${svc.commission.toFixed(2)}</td>
                                <td className="text-[10px] text-blue-600 py-1 text-right">${svc.companyProfit?.toFixed(2) || '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t border-gray-300">
                <td className="p-2 text-xs" colSpan="2">TOTALES</td>
                <td className="p-2 text-center text-xs">
                  {data.reduce((acc, curr) => acc + curr.serviceCount, 0)}
                </td>
                <td className="p-2 text-right text-xs">
                  ${data.reduce((acc, curr) => acc + (curr.totalSales || 0), 0).toFixed(2)}
                </td>
                <td className="p-2 text-right text-xs text-green-600">
                  ${data.reduce((acc, curr) => acc + (curr.totalCommission || 0), 0).toFixed(2)}
                </td>
                <td className="p-2 text-right text-xs text-blue-600">
                  ${data.reduce((acc, curr) => acc + (curr.totalCompanyProfit || 0), 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-8 pt-4 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-400">
              Generado el {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </Page>
    </Document>
  );
};
