const express = require('express');
const cors = require('cors');
const {
  getRecentSales,
  getRecentDueBalance,
  getSalesmen,
  getShopNames,
  getItems,
  getPaymodes,
  getRmdCstm,
  getSalesByBillNumber,
  getDueBalanceByBillNumber,
  checkDuplicateBillNumber,
  insertSalesData,
  updateSalesData,
} = require('./bigquery');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/recent-sales', async (req, res) => {
  try {
    const data = await getRecentSales();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent sales' });
  }
});

app.get('/api/recent-due-balance', async (req, res) => {
  try {
    const data = await getRecentDueBalance();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent due balances' });
  }
});

app.get('/api/salesmen', async (req, res) => {
  try {
    const data = await getSalesmen();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch salesmen' });
  }
});

app.get('/api/shop-names', async (req, res) => {
  try {
    const data = await getShopNames();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop names' });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const data = await getItems();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/paymodes', async (req, res) => {
  try {
    const data = await getPaymodes();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paymodes' });
  }
});

app.get('/api/rmd-cstm', async (req, res) => {
  try {
    const data = await getRmdCstm();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rmd_cstm' });
  }
});

app.get('/api/sales', async (req, res) => {
  const { billNumber, date } = req.query;
  if (!billNumber || !date) {
    return res.status(400).json({ error: 'Bill number and date are required' });
  }
  try {
    const data = await getSalesByBillNumber(billNumber, date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

app.get('/api/due-balance', async (req, res) => {
  const { billNumber, date } = req.query;
  if (!billNumber || !date) {
    return res.status(400).json({ error: 'Bill number and date are required' });
  }
  try {
    const data = await getDueBalanceByBillNumber(billNumber, date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch due balance data' });
  }
});

app.get('/api/check-duplicate', async (req, res) => {
  const { billNumber, date } = req.query;
  if (!billNumber || !date) {
    return res.status(400).json({ error: 'Bill number and date are required' });
  }
  try {
    const data = await checkDuplicateBillNumber(billNumber, date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check duplicate bill number' });
  }
});

app.post('/api/sales', async (req, res) => {
  const { salesData, balanceDueData, billNumbersData, paymentData } = req.body;
  if (!salesData || !balanceDueData || !billNumbersData || !paymentData) {
    return res.status(400).json({ error: 'Missing required data' });
  }
  try {
    await insertSalesData(salesData, balanceDueData, billNumbersData, paymentData);
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert data' });
  }
});

app.put('/api/sales/update', async (req, res) => {
  const { salesData, balanceDueData, billNumbersData, paymentData } = req.body;
  if (!salesData || !balanceDueData || !billNumbersData || !paymentData) {
    return res.status(400).json({ error: 'Missing required data' });
  }
  try {
    await updateSalesData(salesData, balanceDueData, billNumbersData, paymentData);
    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});