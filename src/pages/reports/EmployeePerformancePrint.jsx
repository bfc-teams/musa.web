import React, { useEffect, useState } from 'react';
import { EmployeePerformancePDF } from './EmployeePerformancePDF';

export const EmployeePerformancePrint = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    // Retrieve data from localStorage
    const storedData = localStorage.getItem('printData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setData(parsed.data);
      setPeriod(parsed.period);

      // Clear after loading? Maybe keep in case of refresh.
      // localStorage.removeItem('printData');

      // Auto print after a short delay to ensure render
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  if (!data) return <div>Cargando datos del reporte...</div>;

  return (
    <div style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      <EmployeePerformancePDF
        data={data}
        startDate={period.startDate}
        endDate={period.endDate}
      />
    </div>
  );
};
