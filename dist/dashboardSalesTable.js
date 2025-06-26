import React, { useState, useEffect } from 'react';

const fetchPrintData = async (billNumber, date, userEmail, showNotification) => {
  const payload = { action: 'getSalesDataByBillNumberAndDate', billNumber, date, userEmail };
  console.log('fetchPrintData payload:', payload);
  try {
    const response = await fetch(window.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log('fetchPrintData response:', result);
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error) {
    showNotification('Error fetching print data: ' + error.message, 'error');
    return null;
  }
};

function SalesRecentTable({ userEmail, showNotification }) {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSalesData = async () => {
    setIsLoading(true);
    const payload = { action: 'getRecentEntries', table: 'SalesData', userEmail, limit: 20 };
    console.log('fetchSalesData payload:', payload);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('fetchSalesData response:', result);
      if (result.error) throw new Error(result.error);
      setSales(result.recentEntries || []);
    } catch (error) {
      showNotification('Error fetching sales data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [userEmail]);

  const initializeForm = (billNumber, date) => {
    if (window.salesFormInitialize) {
      window.salesFormInitialize(billNumber, date);
    }
  };

  return React.createElement(
    'div',
    { className: 'table-container' },
    isLoading && React.createElement('div', { className: 'loading-overlay' }, 'Loading sales data...'),
    React.createElement(
      'table',
      { className: 'sales-table' },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement('th', null, 'Date'),
          React.createElement('th', null, 'Bill Number'),
          React.createElement('th', null, 'Shop'),
          React.createElement('th', null, 'Salesman'),
          React.createElement('th', null, 'Amount'),
          React.createElement('th', null, 'Actions')
        )
      ),
      React.createElement(
        'tbody',
        null,
        sales.map((sale, index) => React.createElement(
          'tr',
          { key: index },
          React.createElement('td', null, sale.Date ? sale.Date : 'Unknown'),
          React.createElement('td', null, sale.Bill_Number),
          React.createElement('td', null, sale.Shop_Name || 'Unknown'),
          React.createElement('td', null, sale.Salesman || 'Unknown'),
          React.createElement('td', null, sale.Total_Amount || 0),
          React.createElement(
            'td',
            null,
            React.createElement(
              'button',
              {
                onClick: () => initializeForm(sale.Bill_Number, sale.Date),
                className: 'bg-blue-500 text-white p-1 rounded mr-2'
              },
              'Edit'
            )
          )
        ))
      )
    )
  );
}

function SalesPrintPreview({ sales, showNotification }) {
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPrintData(sales.billNumber, sales.date, sales.userEmail, showNotification);
      setPrintData(data);
    };
    if (sales.billNumber && sales.date) {
      fetchData();
    }
  }, [sales.billNumber, sales.date, sales.userEmail]);

  return React.createElement(
    'div',
    { id: 'salesPrintPreview', className: 'print-preview' },
    printData ? React.createElement(
      'div',
      null,
      React.createElement('h3', null, 'Sales Receipt'),
      React.createElement('p', null, `Bill Number: ${printData.billNumber}`),
      React.createElement('p', null, `Date: ${printData.date}`),
      React.createElement('p', null, `Shop: ${printData.salesData[0]?.Shop_Name || 'Unknown'}`),
      React.createElement('p', null, `Salesman: ${printData.salesData[0]?.Salesman || 'Unknown'}`)
    ) : React.createElement('div', null, 'No data available')
  );
}

window.SalesRecentTable = SalesRecentTable;
window.SalesPrintPreview = SalesPrintPreview;

export default SalesRecentTable;