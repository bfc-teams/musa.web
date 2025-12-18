import * as XLSX from 'xlsx';

export const exportToExcel = (data, headers, filename = 'report.xlsx') => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // 1. Transform Data for Excel
  // We map the data to match the Header Labels as keys, so SheetJS uses them as headers automatically.
  const headerKeys = Object.keys(headers);
  const formattedData = data.map(row => {
    const newRow = {};
    headerKeys.forEach(key => {
      let value = row[key];

      // Handle nested properties
      if (key.includes('.')) {
        const keys = key.split('.');
        let nestedVal = row;
        for (const k of keys) {
          nestedVal = nestedVal ? nestedVal[k] : null;
        }
        value = nestedVal;
      }

      // Use the Label as the key for the final object
      const label = headers[key];
      newRow[label] = value;
    });
    return newRow;
  });

  // 2. Create WorkSheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // 3. Create WorkBook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

  // 4. Write File
  XLSX.writeFile(workbook, filename);
};
