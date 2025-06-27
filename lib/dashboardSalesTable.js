const { useState, useEffect } = React;

function SalesRecentTable({ userEmail, showNotification }) {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getRecentSales', userEmail })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setSalesData(result || []);
    } catch (error) {
      showNotification(`Error fetching recent sales: ${error.message}`, 'error');
    }
  };

  return React.createElement(
    'table',
    { className: 'w-full border-collapse' },
    React.createElement(
      'thead',
      null,
      React.createElement(
        'tr',
        { className: 'bg-gray-200' },
        React.createElement('th', { className: 'border p-2' }, 'Date'),
        React.createElement('th', { className: 'border p-2' }, 'Bill Number'),
        React.createElement('th', { className: 'border p-2' }, 'Salesman'),
        React.createElement('th', { className: 'border p-2' }, 'Shop Name'),
        React.createElement('th', { className: 'border p-2' }, 'Actions')
      )
    ),
    React.createElement(
      'tbody',
      null,
      salesData.map((sale, index) => React.createElement(
        'tr',
        { key: index, className: 'border-t' },
        React.createElement('td', { className: 'border p-2' }, sale.Date || ''),
        React.createElement('td', { className: 'border p-2' }, sale.Bill_Number || ''),
        React.createElement('td', { className: 'border p-2' }, sale.Salesman || ''),
        React.createElement('td', { className: 'border p-2' }, sale.Shop_Name || ''),
        React.createElement(
          'td',
          { className: 'border p-2' },
          React.createElement(
            'button',
            {
              className: 'bg-blue-500 text-white p-1 rounded',
              onClick: () => window.salesFormInitialize(sale.Bill_Number, sale.Date)
            },
            'Edit'
          )
        )
      ))
    )
  );
}

function SalesPrintPreview({ sales, showNotification }) {
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    fetchPrintData();
  }, []);

  const fetchPrintData = async () => {
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getPrintData', userEmail: sales })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setPrintData(result);
    } catch (error) {
      showNotification(`Error fetching print data: ${error.message}`, 'error');
    }
  };

  if (!printData) {
    return React.createElement('div', null, 'Loading print preview...');
  }

  return React.createElement(
    'div',
    { id: 'salesPrintPreview' },
    React.createElement('h3', { className: 'text-lg font-bold' }, 'Print Preview'),
    React.createElement('p', null, `Bill Number: ${printData.Bill_Number || ''}`),
    React.createElement('p', null, `Date: ${printData.Date || ''}`),
    React.createElement('p', null, `Salesman: ${printData.Salesman || ''}`),
    React.createElement('p', null, `Shop Name: ${printData.Shop_Name || ''}`)
  );
}

window.SalesRecentTable = SalesRecentTable;
window.SalesPrintPreview = SalesPrintPreview;