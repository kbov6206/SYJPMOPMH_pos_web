window.API_URL = "https://us-central1-myposdata.cloudfunctions.net/sales";

const SalesRecentTable = ({ userEmail, showNotification }) => {
  const { useState, useEffect } = React;
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchSalesData();
  }, [userEmail]);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getRecentSales', userEmail })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setSalesData(result);
      setFilteredData(result);
    } catch (error) {
      showNotification(`Error fetching recent sales: ${error.message}`, 'error');
    }
  };

  const handleKeywordSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setKeyword(searchTerm);
    const filtered = salesData.filter(row =>
      Object.values(row).some(val =>
        val && val.toString().toLowerCase().includes(searchTerm)
      )
    );
    setFilteredData(filtered);
  };

  const handleEdit = (billNumber, date) => {
    window.salesFormInitialize(billNumber, date);
  };

  return React.createElement(
    'div',
    { className: 'table-container' },
    React.createElement(
      'div',
      { className: 'keyword-search' },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Search sales...',
        value: keyword,
        onChange: handleKeywordSearch,
        className: 'border p-2 rounded w-full'
      })
    ),
    React.createElement(
      'table',
      { className: 'sales-table' },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          ['Date', 'Bill Number', 'Salesman', 'Shop Name', 'Department', 'Item', 'Amount', 'RMD/CSTM', 'Paymode', 'Amount Received', 'Action'].map(header =>
            React.createElement('th', { key: header }, header)
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        filteredData.map((row, index) =>
          React.createElement(
            'tr',
            { key: index },
            React.createElement('td', null, row.Date),
            React.createElement('td', null, row.Bill_Number),
            React.createElement('td', null, row.Salesman),
            React.createElement('td', null, row.Shop_Name),
            React.createElement('td', null, row.Department),
            React.createElement('td', null, row.Item),
            React.createElement('td', null, row.Amount),
            React.createElement('td', null, row.RMD_CSTM),
            React.createElement('td', null, row.Paymode),
            React.createElement('td', null, row.Amount_Received),
            React.createElement(
              'td',
              null,
              React.createElement(
                'button',
                {
                  onClick: () => handleEdit(row.Bill_Number, row.Date),
                  className: 'bg-blue-500 text-white p-1 rounded'
                },
                'Edit'
              )
            )
          )
        )
      )
    )
  );
};

const SalesPrintPreview = ({ sales, showNotification }) => {
  const { useState, useEffect } = React;
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    fetchPrintData();
  }, [sales]);

  const fetchPrintData = async () => {
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSalesDataByBillNumberAndDate', userEmail: sales })
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
    React.createElement('h3', null, 'Print Preview'),
    React.createElement(
      'table',
      { className: 'sales-table' },
      React.createElement(
        'tbody',
        null,
        printData.salesData.map((row, index) =>
          React.createElement(
            'tr',
            { key: index },
            React.createElement('td', null, row.Date),
            React.createElement('td', null, row.Bill_Number),
            React.createElement('td', null, row.Salesman),
            React.createElement('td', null, row.Shop_Name),
            React.createElement('td', null, row.Item),
            React.createElement('td', null, row.Amount)
          )
        )
      )
    )
  );
};

window.SalesRecentTable = SalesRecentTable;
window.SalesPrintPreview = SalesPrintPreview;
