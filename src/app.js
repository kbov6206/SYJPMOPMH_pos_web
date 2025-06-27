import React, { useState, useEffect } from 'react';
import flatpickr from 'flatpickr';

const API_URL = 'https://us-central1-myposdata.cloudfunctions.net/sales';
const userEmail = 'reachadeel@gmail.com'; // Replace with actual auth logic

const App = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [salesData, setSalesData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [printData, setPrintData] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`${API_URL}/getRecentEntries?table=SYJPMOPMHSalesData&email=${userEmail}&limit=100`);
      const data = await response.json();
      if (data.error) {
        showNotification(data.error, 'error');
        return;
      }
      setSalesData(data.rows || []);
    } catch (error) {
      showNotification('Failed to fetch sales data', 'error');
    }
  };

  const handleSubmitSale = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const sale = {
      Date: formData.get('date'),
      Bill_Number: formData.get('billNumber'),
      Amount_Received: parseFloat(formData.get('amountReceived')),
      Paymode: formData.get('paymode'),
      Items: formData.get('items'),
      Department: formData.get('department'),
      User_Email: userEmail,
    };

    try {
      const response = await fetch(`${API_URL}/insertSale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      const result = await response.json();
      if (result.error) {
        showNotification(result.error, 'error');
      } else {
        showNotification('Sale added successfully', 'info');
        fetchSalesData();
        event.target.reset();
      }
    } catch (error) {
      showNotification('Failed to add sale', 'error');
    }
  };

  const handlePrintPreview = async (paymentDataId) => {
    try {
      const response = await fetch(`${API_URL}/getPrintData?paymentDataId=${paymentDataId}`);
      const data = await response.json();
      if (data.error) {
        showNotification(data.error, 'error');
      } else {
        setPrintData(data);
      }
    } catch (error) {
      showNotification('Failed to load print preview', 'error');
    }
  };

  const handlePrint = () => {
    if (printData) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>Print Receipt</title></head>
          <body>
            <h1>Receipt</h1>
            <p>Bill Number: ${printData.Bill_Number}</p>
            <p>Date: ${printData.Date}</p>
            <p>Amount: ${printData.Amount_Received}</p>
            <p>Paymode: ${printData.Paymode}</p>
            <p>Items: ${printData.Items}</p>
            <p>Department: ${printData.Department}</p>
            <button onclick="window.print()">Print</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  useEffect(() => {
    if (activeModule === 'sales') {
      fetchSalesData();
    }
    flatpickr('#date-picker', { dateFormat: 'Y-m-d' });
  }, [activeModule]);

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <header className="mb-4">
        <h1 className="text-2xl font-bold">PM-POS Data Entry Dashboard</h1>
        <nav className="mt-2">
          <button
            className={`px-4 py-2 mr-2 ${activeModule === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveModule('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 ${activeModule === 'sales' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveModule('sales')}
          >
            Sales
          </button>
        </nav>
      </header>

      <div className={`module ${activeModule === 'dashboard' ? 'active' : ''}`}>
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setActiveModule('sales')}
          >
            Sales Entry
          </button>
        </div>
      </div>

      <div className={`module ${activeModule === 'sales' ? 'active' : ''}`}>
        <h2 className="text-xl font-semibold mb-4">Sales Entry</h2>
        <form onSubmit={handleSubmitSale} className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block">Date</label>
              <input id="date-picker" name="date" className="border p-2 w-full" required />
            </div>
            <div>
              <label className="block">Bill Number</label>
              <input name="billNumber" className="border p-2 w-full" required />
            </div>
            <div>
              <label className="block">Amount Received</label>
              <input type="number" step="0.01" name="amountReceived" className="border p-2 w-full" required />
            </div>
            <div>
              <label className="block">Paymode</label>
              <select name="paymode" className="border p-2 w-full" required>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div>
              <label className="block">Items</label>
              <input name="items" className="border p-2 w-full" required />
            </div>
            <div>
              <label className="block">Department</label>
              <input name="department" className="border p-2 w-full" required />
            </div>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
            Submit Sale
          </button>
        </form>

        <h3 className="text-lg font-semibold mb-2">Recent Sales</h3>
        <table className="sales-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bill Number</th>
              <th>Amount</th>
              <th>Paymode</th>
              <th>Items</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale, index) => (
              <tr key={index}>
                <td>{sale.Date}</td>
                <td>{sale.Bill_Number}</td>
                <td>{sale.Amount_Received.toFixed(2)}</td>
                <td>{sale.Paymode}</td>
                <td>{sale.Items}</td>
                <td>{sale.Department}</td>
                <td>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => handlePrintPreview(sale.PaymentData_ID)}
                  >
                    Print Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {printData && (
          <div className="print-sidebar open">
            <h3 className="text-lg font-semibold mb-2">Print Preview</h3>
            <p>Bill Number: {printData.Bill_Number}</p>
            <p>Date: {printData.Date}</p>
            <p>Amount: {printData.Amount_Received}</p>
            <p>Paymode: {printData.Paymode}</p>
            <p>Items: {printData.Items}</p>
            <p>Department: {printData.Department}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
              onClick={handlePrint}
            >
              Print
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 mt-2 rounded"
              onClick={() => setPrintData(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
```