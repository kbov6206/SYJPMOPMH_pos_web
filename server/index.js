const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { insertSalesData, checkDuplicateBillNumber, getNames, getRecentSales, getSalesData, updateSalesData, insertDueBalanceData, getRecentDueBalances, getDueBalanceData, updateDueBalanceData } = require('./bigquery');
const app = express();

app.use(cors({ origin: ['https://kbov6206.github.io/SYJPMOPMH_pos_web', 'http://localhost:3000'] }));
app.use(express.json());

app.get('/api/names', async (req, res) => {
  try {
    const names = await getNames();
    res.json(names);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recent-sales', async (req, res) => {
  try {
    const sales = await getRecentSales();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales', async (req, res) => {
  const { billNumber, date } = req.query;
  try {
    const data = await getSalesData(billNumber, date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recent-due-balances', async (req, res) => {
  try {
    const dueBalances = await getRecentDueBalances();
    res.json(dueBalances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/due-balance', async (req, res) => {
  const { billNumber, date } = req.query;
  try {
    const data = await getDueBalanceData(billNumber, date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/check-duplicate', async (req, res) => {
  const { billNumber, date } = req.query;
  try {
    const isDuplicate = await checkDuplicateBillNumber(billNumber, date);
    res.json({ isDuplicate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const data = req.body;
  try {
    const rowsSaved = await insertSalesData(data, 'reachadeel@gmail.com');
    res.json({ rowsSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sales/update', async (req, res) => {
  const data = req.body;
  try {
    const rowsSaved = await updateSalesData(data, 'reachadeel@gmail.com');
    res.json({ rowsSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/due-balance', async (req, res) => {
  const data = req.body;
  try {
    const rowsSaved = await insertDueBalanceData(data, 'reachadeel@gmail.com');
    res.json({ rowsSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/due-balance/update', async (req, res) => {
  const data = req.body;
  try {
    const rowsSaved = await updateDueBalanceData(data, 'reachadeel@gmail.com');
    res.json({ rowsSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));