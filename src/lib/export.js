import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPdf = (columns, data, filename) => {
  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait'
  });
  doc.autoTable({
    head: [columns],
    body: data,
    styles: { font: 'Arial' },
    headStyles: { fillColor: [22, 163, 74] },
  });
  doc.save(`${filename}.pdf`);
};