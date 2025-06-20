const express = require('express');
const cors = require('cors');
const { insertSalesData, insertDueBalanceData, getRecentSales, getRecentDueBalances, getNames, updateSalesData, updateDueBalanceData, getSalesData, getDueBalanceData, checkDuplicateBillNumber } = require('./api/bigquery.js');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://kbov6206.github.io', 'https://sy-jpm-pos-web-uc.a.run.app', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

app.use(express.json({ limit: '50mb' }));

// API Routes
app.get('/api/names', async (req, res) => {
  try {
    const names = await getNames();
    res.json(names);
  } catch (error) {
    console.error('Error fetching names:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch names', details: error.message });
  }
});

app.get('/api/recent-sales', async (req, res) => {
  try {
    const salesData = await getRecentSales();
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching recent sales:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch recent sales', details: error.message });
  }
});

app.get('/api/recent-due-balances', async (req, res) => {
  try {
    const dueBalanceData = await getRecentDueBalances();
    res.json(dueBalanceData);
  } catch (error) {
    console.error('Error fetching recent due balances:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch recent due balances', details: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const data = req.body;
    const result = await insertSalesData(data);
    res.json({ message: 'Sales data inserted successfully', result });
  } catch (error) {
    console.error('Error inserting sales data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to insert sales data', details: error.message });
  }
});

app.put('/api/sales/update', async (req, res) => {
  try {
    const data = req.body;
    const result = await updateSalesData(data);
    res.json({ message: 'Sales data updated successfully', result });
  } catch (error) {
    console.error('Error updating sales data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update sales data', details: error.message });
  }
});

app.post('/api/due-balance', async (req, res) => {
  try {
    const data = req.body;
    const result = await insertDueBalanceData(data);
    res.json({ message: 'Due balance data inserted successfully', result });
  } catch (error) {
    console.error('Error inserting due balance data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to insert due balance data', details: error.message });
  }
});

app.put('/api/due-balance/update', async (req, res) => {
  try {
    const data = req.body;
    const result = await updateDueBalanceData(data);
    res.json({ message: 'Due balance data updated successfully', result });
  } catch (error) {
    console.error('Error updating due balance data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update due balance data', details: error.message });
  }
});

app.get('/api/sales', async (req, res) => {
  try {
    const { billNumber, date } = req.query;
    const salesData = await getSalesData(billNumber, date);
    res.json({ salesData });
  } catch (error) {
    console.error('Error fetching sales data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch sales data', details: error.message });
  }
});

app.get('/api/due-balance', async (req, res) => {
  try {
    const { billNumber, date } = req.query;
    const dueBalanceData = await getDueBalanceData(billNumber, date);
    res.json({ dueBalanceData });
  } catch (error) {
    console.error('Error fetching due balance data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch due balance data', details: error.message });
  }
});

app.get('/api/check-duplicate', async (req, res) => {
  try {
    const { billNumber, date } = req.query;
    const isDuplicate = await checkDuplicateBillNumber(billNumber, date);
    res.json({ isDuplicate });
  } catch (error) {
    console.error('Error checking duplicate bill number:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to check duplicate bill number', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});