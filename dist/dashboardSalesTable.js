const API_URL = "https://us-central1-myposdata.cloudfunctions.net/sales";
const SalesRecentTable = ({
  userEmail,
  showNotification
}) => {
  const [recentEntries, setRecentEntries] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  React.useEffect(() => {
    const fetchRecentEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'getRecentEntries',
            table: 'PaymentData',
            userEmail,
            limit: 20
          })
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        setRecentEntries(result.recentEntries || []);
      } catch (error) {
        showNotification(`Error fetching recent entries: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentEntries();
  }, [userEmail]);
  return React.createElement('div', {
    className: 'table-container'
  }, isLoading ? React.createElement('div', {
    className: 'loading-overlay'
  }, 'Loading recent entries...') : React.createElement('table', {
    className: 'sales-table'
  }, React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, 'Date'), React.createElement('th', null, 'Bill Number'), React.createElement('th', null, 'Amount Received'), React.createElement('th', null, 'Paymode'), React.createElement('th', null, 'Items'), React.createElement('th', null, 'Timestamp'))), React.createElement('tbody', null, recentEntries.map(entry => React.createElement('tr', {
    key: entry.PaymentData_ID,
    onClick: () => window.salesFormInitialize(entry.Bill_Number, entry.Date)
  }, React.createElement('td', null, entry.Date), React.createElement('td', null, entry.Bill_Number), React.createElement('td', null, entry.Amount_Received.toFixed(2)), React.createElement('td', null, entry.Paymode), React.createElement('td', null, entry.Items), React.createElement('td', null, new Date(entry.Timestamp).toLocaleString()))))));
};
const SalesPrintPreview = ({
  sales,
  showNotification
}) => {
  const [salesData, setSalesData] = React.useState(null);
  React.useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'getSalesDataByBillNumberAndDate',
            billNumber: sales.billNumber,
            date: sales.date,
            userEmail: sales
          })
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        setSalesData(result);
      } catch (error) {
        showNotification(`Error fetching print data: ${error.message}`, 'error');
      }
    };
    if (sales.billNumber && sales.date) {
      fetchSalesData();
    }
  }, [sales]);
  return React.createElement('div', {
    id: 'salesPrintPreview'
  }, salesData ? React.createElement('div', null, salesData, React.createElement('h3', null, 'Sales Receipt'), React.createElement('p', null, `Bill Number: ${salesData.salesData[0]?.Bill_Number || ''}`), React.createElement('p', null, `Date: ${salesData.salesData[0]?.Date || ''}`), React.createElement('p', null, `Salesman: ${salesData.salesData[0]?.Salesman || ''}`), React.createElement('p', null, `Shop Name: ${salesData.salesData[0]?.Shop_Name || ''}`), React.createElement('p', null, `Department: ${salesData.salesData[0]?.Department || ''}`), React.createElement('table', {
    className: 'sales-table'
  }, React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, 'Item'), React.createElement('th', null, 'Amount'), React.createElement('th', null, 'RMD/CSTM'))), React.createElement('tbody', null, salesData.salesData.map(row => React.createElement('tr', {
    key: row.Item
  }, React.createElement('td', null, row.Item), React.createElement('td', null, row.Amount.toFixed(2)), React.createElement('td', null, row.RMD_CSTM))))), React.createElement('table', {
    className: 'sales-table'
  }, React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, 'Paymode'), React.createElement('th', null, 'Amount Received'))), React.createElement('tbody', null, salesData.paymentData.map(row => React.createElement('tr', {
    key: row.Paymode
  }, React.createElement('td', null, row.Paymode), React.createElement('td', null, row.Amount_Received.toFixed(2))))))) : React.createElement('div', null, 'Select a bill to preview'));
};
window.SalesRecentTable = SalesRecentTable;
window.SalesPrintPreview = SalesPrintPreview;
