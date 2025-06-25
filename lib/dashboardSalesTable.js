const SalesRecentTable = ({ userEmail, showNotification }) => {
  const [rows, setRows] = React.useState([]);
  const [expandedDates, setExpandedDates] = React.useState({});

  React.useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const response = await fetch('https://us-central1-myposdata.cloudfunctions.net/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getRecentEntries', table: 'PaymentData', userEmail, limit: 20 })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setRows(data.rows || []);
      } catch (error) {
        console.error('Failed to fetch recent sales:', error);
        showNotification('Error fetching recent sales: ' + error.message, 'error');
      }
    };
    fetchRecentSales();
  }, [userEmail, showNotification]);

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  if (!rows.length) {
    return <div>No data available.</div>;
  }

  const maxRows = 20;
  const sortedRows = rows
    .sort((a, b) => new Date(b.Date || 0) - new Date(a.Date || 0))
    .slice(0, maxRows);

  let currentDate = null;
  let dateTotal = 0;
  const tableRows = [];

  sortedRows.forEach(row => {
    const rowDate = row.Date || 'Unknown';
    const amount = parseFloat(row.Amount_Received || 0);

    if (rowDate !== currentDate) {
      if (currentDate !== null) {
        tableRows.push(
          <tr key={`subtotal-${currentDate}`} className="date-subtotal" data-date={currentDate}>
            <td>Total for {currentDate}</td>
            <td></td>
            <td>{dateTotal.toFixed(2)}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        );
      }
      currentDate = rowDate;
      dateTotal = 0;
      tableRows.push(
        <tr key={`date-${rowDate}`} className="date-row" data-date={rowDate}>
          <td>
            <span
              className="table-icon"
              data-level="date"
              data-date={rowDate}
              onClick={() => toggleDate(rowDate)}
            >
              {expandedDates[rowDate] ? '[-]' : '[+]'}
            </span>
            {rowDate}
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      );
    }

    dateTotal += amount;
    const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
    tableRows.push(
      <tr
        key={row.PaymentData_ID || row.Bill_Number}
        className="data-row"
        data-date={rowDate}
        style={{ display: expandedDates[rowDate] ? '' : 'none' }}
      >
        <td></td>
        <td>{row.Bill_Number || ''}</td>
        <td>{formattedAmount}</td>
        <td>{row.Paymode || ''}</td>
        <td>{row.Items || ''}</td>
        <td>{row.PaymentData_ID || ''}</td>
        <td>
          <button
            className="edit-btn bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
            onClick={() => {
              if (window.salesFormInitialize) {
                window.salesFormInitialize(row.Bill_Number, row.Date);
              } else {
                showNotification('Edit form not found', 'error');
              }
            }}
          >
            Edit
          </button>
        </td>
      </tr>
    );
  });

  if (currentDate !== null) {
    tableRows.push(
      <tr key={`subtotal-${currentDate}`} className="date-subtotal" data-date={currentDate}>
        <td>Total for {currentDate}</td>
        <td></td>
        <td>{dateTotal.toFixed(2)}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    );
  }

  return (
    <div className="table-container">
      <h3>Recent Sales</h3>
      <table className="sales-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Bill Number</th>
            <th>Amount Received</th>
            <th>Paymode</th>
            <th>Items</th>
            <th>PaymentData ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

const SalesPrintPreview = ({ userEmail, showNotification }) => {
  const [billNumber, setBillNumber] = React.useState('');
  const [salesData, setSalesData] = useState(null);

  const fetchSalesData = async () => {
    if (!billNumber) {
      showNotification('Please enter a bill number.', 'error');
      return;
    }
    try {
      const response = await fetch('https://us-central1-myposdata.cloudfunctions.net/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSalesDataByBillNumber', billNumber, userEmail })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (!data.salesData || !data.salesData.length === 0) {
        showNotification('No sales data found for this bill number.', 'error');
        setSalesData(null);
      } else {
        setSalesData(data);
      }
    } catch (error) {
      console.error('Error retrieving sales print preview:', error);
      showNotification('Error retrieving sales data: ' + error.message, 'error');
    }
  };

  return (
    <div className="sales">
      <div className="keyword-search">
        <label htmlFor="salesKeyword" className="block">Search by Bill Number</label>
        <input
          type="text"
          id="salesKeyword"
          value={billNumber}
          onChange={e => setBillNumber(e.target.value)}
          placeholder="Enter Bill Number"
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          id="salesSearchBtn"
          className="bg-blue-600 text-white p-2 rounded mt-4 w-full hover:bg-blue-700"
          onClick={fetchSalesData}
        >
          Search
        </button>
      </div>
      <div id="salesPrintPreview">
        {salesData ? (
          <div>
            <h3>Sales Data</h3>
            <p>Bill Number: {salesData.salesData[0]?.Bill_Number || ''}</p>
            <p>Date: {salesData.salesData[0]?.Date || ''}</p>
            <p>Salesman: {salesData.salesData[0]?.Salesman || ''}</p>
            <p>Shop Name: {salesData.salesData[0]?.Shop_Name || ''}</p>
            <p>Department: {salesData.salesData[0]?.Department || ''}</p>
            <p>Mobile Number: {salesData.salesData[0]?.data[0]?.Mobile || ''}</p>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>RMD/CSTM</th>
                </tr>
              </thead>
              <tbody>
                {salesData.salesData.map(row => (
                  <tr key={row.Id || row.Item}>
                    <td>{row.Item || ''}</td>
                    <td>{row.Amount !== null ? Number(row.Amount || 0).toFixed(2)} : '0.00'}</td>
                    <td>{row.RMD || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {salesData && salesData.paymentData.paymentRows && salesData.paymentRows.length > 0 && (
              <div>
                <h3>Payment Data</h3>
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Paymode</th>
                      <th>Amount Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.paymentRows.map(row => (
                      <tr key={row.PaymentData || row.Paymode || ''}>
                        <td>{row.Paymode || ''}</td>
                        <td>{row.Amount_Received || null !== '' ? Number(row.Amount_Received || 0).toFixed(2)} : '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </div>
  );
};

window.SalesRecentTable = SalesRecentTable;
window.SalesPrintPreview = SalesPrintPreview;