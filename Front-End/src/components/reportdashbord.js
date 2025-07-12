import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../styles/reportdashbord.css'; // Assuming you have some styles for the report dashboard

const endpoints = [
  { key: 'expensive-products', title: 'المنتجات الغالية' },
  { key: 'admins-with-many-products', title: 'أدمنز لديهم منتجات كثيرة' },
  { key: 'orders-with-users', title: 'الطلبات مع المستخدمين' },
  { key: 'products-with-admins', title: 'المنتجات مع الأدمنز' },
  { key: 'orders-with-payments', title: 'الطلبات مع المدفوعات' },
  { key: 'products-above-average', title: 'المنتجات فوق السعر المتوسط' },
  { key: 'total-revenue', title: 'إجمالي الأرباح' },
  { key: 'total-users', title: 'عدد المستخدمين' },
  { key: 'avg-quantity', title: 'متوسط الكمية في الطلبات' },
  { key: 'low-stock-products', title: 'المنتجات قليلة المخزون' },
];

const exportToPDF = (title, data) => {
  const doc = new jsPDF();
  doc.text(title, 10, 10);

  if (Array.isArray(data) && data.length > 0) {
    const columns = Object.keys(data[0]);
    const rows = data.map(item => columns.map(col => item[col]));
    autoTable(doc, { head: [columns], body: rows, startY: 20 });
  } else {
    doc.text(JSON.stringify(data), 10, 20);
  }

  doc.save(`${title}.pdf`);
};

const exportToExcel = (title, data) => {
  const worksheet = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${title}.xlsx`);
};

const ReportCard = ({ title, data }) => (
  <div className="report-card">
    <div className="card-header">
      <h2>{title}</h2>
      <div className="btn-group">
        <button onClick={() => exportToPDF(title, data)} className="report-btn pdf-btn">PDF</button>
        <button onClick={() => exportToExcel(title, data)} className="report-btn excel-btn">Excel</button>
      </div>
    </div>
    {Array.isArray(data) ? (
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    ) : (
      <p>{JSON.stringify(data)}</p>
    )}
  </div>
);

const ReportDashboard = () => {
  const [reports, setReports] = useState({});

  useEffect(() => {
    endpoints.forEach(({ key }) => {
      fetch(`http://localhost:5000/api/reports/${key}`)
        .then(response => response.json())
        .then(data => setReports(prev => ({ ...prev, [key]: data })))
        .catch(err => setReports(prev => ({ ...prev, [key]: { error: err.message } })));
    });
  }, []);

  return (
    <div className="dashboard-container">
      {endpoints.map(({ key, title }) => (
        <ReportCard key={key} title={title} data={reports[key] || 'جار التحميل...'} />
      ))}
    </div>
  );
};

export default ReportDashboard;
