const express = require('express');
const cors = require('cors');
const bigquery = require('./bigquery');

const app = express();

// Enable CORS for the GitHub Pages origin
app.use(cors({
  origin: 'https://kbov6206.github.io',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'SYJPMOPMH POS Web Backend' });
});

// API endpoints
app.get('/api/names', async (req, res) => {
  try {
    const [salesmen, shopNames, items, paymodes, rmdCstm] = await Promise.all([
      bigquery.getSalesmen(),
      bigquery.getShopNames(),
      bigquery.getItems(),
      bigquery.getPaymodes(),
      bigquery.getRmdCstm(),
    ]);
    res.json({ salesmen, shopNames, items, paymodes, rmdCstm });
  } catch (error) {
    console.error('Error fetching names:', error);
    res.status(500).json({ error: 'Failed to fetch names' });
  }
});

app.get('/api/recent-sales', async (req, res) => {
  try {
    const sales = await bigquery.getRecentSales();
    res.json(sales);
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    res.status(500).json({ error: 'Failed to fetch recent sales' });
  }
});

app.get('/api/recent-due-balances', async (req, res) => {
  try {
    const balances = await bigquery.getRecentDueBalance();
    res.json(balances);
  } catch (error) {
    console.error('Error fetching recent due balances:', error);
    res.status(500).json({ error: 'Failed to fetch recent due balances' });
  }
});

app.post('/api/save-sales', async (req, res) => {
  try {
    const { date, billNumber, salesman, shopName, department, mobileNumber, items, payments, dueBalanceReceived, dueBalanceBillNumber } = req.body;

    // Validate required fields
    if (!date || !billNumber || !salesman || !shopName || !department || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate bill number
    const { isDuplicate } = await bigquery.checkDuplicateBillNumber(billNumber, date);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Bill number already exists for this date' });
    }

    // Prepare data for insertion
    const timestamp = new Date().toISOString();
    const salesData = items.map(item => ({
      SaleData_ID: `${billNumber}_${Date.now()}`,
      Date: date,
      Bill_Number: billNumber,
      Salesman: salesman,
      Shop_Name: shopName,
      Department: department,
      Mobile_Number: mobileNumber || null,
      Item: item.item,
      Amount: parseFloat(item.amount),
      RMD_CSTM: item.rmdCstm || null,
      Paymode: null,
      Amount_Received: 0,
      Balance_Due: 0,
      Delivery_Date: date,
      Timestamp: timestamp,
      Email_ID: 'reachadeel@gmail.com',
      Timestamp_New: timestamp,
    }));

    const paymentData = payments.map(payment => ({
      PaymentData_ID: `${billNumber}_${Date.now()}`,
      Date: date,
      Bill_Number: billNumber,
      Amount_Received: parseFloat(payment.amountReceived),
      Paymode: payment.paymode,
      Timestamp: timestamp,
    }));

    const billNumbersData = [{
      Bill_Number: billNumber,
      Date: date,
    }];

    const balanceDueData = [{
      BalanceDue_ID: `${billNumber}_${Date.now()}`,
      Date: date,
      Bill_Number: billNumber,
      Salesman: salesman,
      Shop_Name: shopName,
      Department: department,
      Mobile_Number: mobileNumber || null,
      Due_Balance_Received: dueBalanceReceived ? String(dueBalanceReceived) : '0',
      Due_Balance_Bill_Number: dueBalanceBillNumber || null,
      Timestamp: timestamp,
      Email_ID: 'reachadeel@gmail.com',
      Timestamp_New: timestamp,
    }];

    // Insert data into BigQuery
    await bigquery.insertSalesData(salesData, balanceDueData, billNumbersData, paymentData);
    res.json({ message: 'Sales data saved successfully' });
  } catch (error) {
    console.error('Error saving sales data:', error);
    res.status(500).json({ error: 'Failed to save sales data' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});