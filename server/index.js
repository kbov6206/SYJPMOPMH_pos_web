const express = require('express');
const cors = require('cors');
const { insertSalesData, insertDueBalanceData, getRecentSales, getRecentDueBalances, getNames, updateSalesData, updateDueBalanceData, getSalesData, getDueBalanceData, checkDuplicateBillNumber } = require('./api/bigquery.js');

const app = express();

app.use(cors({
  origin: ['https://kbov6206.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

app.use(express.json({ limit: '50mb' }));

app.get('/api/names', async (req, res) => {
  try {
    const names = await getNames();
    res.json(names);
  } catch (error) {
    console.error('Error fetching names:', error.message);
    res.status(500).json({ error: 'Failed to fetch names' });
  }
});

app.get('/api/recent-sales', async (req, res) => {
  try {
    const salesData = await getRecentSales();
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching recent sales:', error.message);
    res.status(500).json({ error: 'Failed to fetch recent sales' });
  }
});

app.get('/api/recent-due-balances', async (req, res) => {
  try {
    const dueBalanceData = await getRecentDueBalances();
    res.json(dueBalanceData);
  } catch (error) {
    console.error('Error fetching recent due balances:', error.message);
    res.status(500).json({ error: 'Failed to fetch recent due balances' });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const data = req.body;
    if (!data.date || !data.billNumber || !data.salesman || !data.shopName || !data.department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await insertSalesData(data, 'reachadeel@gmail.com');
    res.json({ message: 'Sales data inserted successfully', result });
  } catch (error) {
    console.error('Error inserting sales data:', error.message);
    res.status(500).json({ error: 'Failed to insert sales data' });
  }
});

app.put('/api/sales/update', async (req, res) => {
  try {
    const data = req.body;
    if (!data.date || !data.billNumber || !data.salesman || !data.shopName || !data.department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await updateSalesData(data, 'reachadeel@gmail.com');
    res.json({ message: 'Sales data updated successfully', result });
  } catch (error) {
    console.error('Error updating sales data:', error.message);
    res.status(500).json({ error: 'Failed to update sales data' });
  }
});

app.post('/api/due-balance', async (req, res) => {
  try {
    const data = req.body;
    if (!data.date || !data.billNumber || !data.salesman || !data.shopName || !data.department) {
      return res.status(400).json({ error:EEEEFF

System: Missing required fields' });
    }
  });
});

app.put('/api/due-balance/update', async (req, res) => {
  try {
    const data = req.body;
    if (!data.date || !data.billNumber || !data.salesman || !data.shopName || !data.department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await updateDueBalanceData(data, 'reachadeel@gmail.com');
    res.json({ message: 'Due balance data updated successfully', result });
  } catch (error) {
    console.error('Error updating due balance data:', error.message);
    res.status(500).json({ error: 'Failed to update due balance data' });
  }
});

app.get('/api/sales', async (req, res) => {
  try {
    const { billNumber, date } = req.query;
    if (!billNumber || !date) return res.status(400).json({ error: 'Bill number and date are required' });
    const salesData = await getSalesData(billNumber, date);
    res.json({ salesData });
  } catch (error) {
    console.error('Error fetching sales data:', error.message);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

app.get('/api/due-balance', async (req, res) => {
  try {
    const { billNumber, date } = req.query;
    if (!billNumber || !date) return res.status(400).json({ error: 'Bill number and date are required' });
    const dueBalanceData = await getDueBalanceData(billNumber, date);
    res.json({ dueBalanceData });
  } catch (error) {
    console.error('Error fetching due balance data:', error.message);
    res.status(500).json({ error: 'Failed to fetch due balance data' });
  }
});

app.get('/api/check-duplicate', async (req, res) => {
  try {
    const { billNumber, date } = req.query;
    if (!billNumber || !date) return res.status(400).json({ error: 'Bill number and date are required' });
    const isDuplicate = await checkDuplicateBillNumber(billNumber, date);
    res.json({ isDuplicate });
  } catch (error) {
    console.error('Error checking duplicate bill number:', error.message);
    res.status(500).json({ error: 'Failed to check duplicate bill number' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});