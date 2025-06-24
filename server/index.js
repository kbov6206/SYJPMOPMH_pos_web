const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Configure BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'myposdata',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// CORS configuration
app.use(cors({
  origin: 'https://kbov6206.github.io',
  credentials: true,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type'],
}));

// Utility function to execute BigQuery queries
async function executeQuery(query, parameters = []) {
  try {
    const [rows] = await bigquery.query({ query, params: parameters });
    return rows;
  } catch (error) {
    console.error('BigQuery error:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'SYJPMOPMH POS Web Backend' });
});

// Fetch recent sales
app.get('/api/recent-sales', async (req, res) => {
  try {
    const query = `
      SELECT Bill_Number, Date, Salesman, Shop_Name, Department, Mobile_Number, Total_Amount
      FROM \`myposdata.my_database.SalesData\`
      ORDER BY Date DESC
      LIMIT 10
    `;
    const rows = await executeQuery(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    res.status(500).json({ error: 'Failed to fetch recent sales' });
  }
});

// Fetch dropdown options (names)
app.get('/api/names', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT
        (SELECT ARRAY_AGG(DISTINCT Item_Name) FROM \`myposdata.my_database.Items\`) AS items,
        (SELECT ARRAY_AGG(DISTINCT Salesman) FROM \`myposdata.my_database.NamesForSale\`) AS salesmen,
        (SELECT ARRAY_AGG(DISTINCT Paymode) FROM \`myposdata.my_database.Paymode\`) AS paymodes,
        (SELECT ARRAY_AGG(DISTINCT Shop_Name) FROM \`myposdata.my_database.SalesShopName\`) AS shop_names,
        (SELECT ARRAY_AGG(DISTINCT Department) FROM \`myposdata.my_database.SalesDepartment\`) AS departments,
        (SELECT ARRAY_AGG(DISTINCT RCD_CSTM) FROM \`myposdata.my_database.SalesmenRmdCstm\`) AS rmd_cstm
    `;
    const [rows] = await executeQuery(query);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching names:', error);
    res.status(500).json({ error: 'Failed to fetch names' });
  }
});

// Fetch recent due balances
app.get('/api/recent-due-balances', async (req, res) => {
  try {
    const query = `
      SELECT Bill_Number, Balance_Due, Due_Balance_Received
      FROM \`myposdata.my_database.Balance_Due\`
      WHERE Balance_Due > Due_Balance_Received
      ORDER BY Date DESC
      LIMIT 10
    `;
    const rows = await executeQuery(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching due balances:', error);
    res.status(500).json({ error: 'Failed to fetch due balances' });
  }
});

// Save sales data (example endpoint)
app.post('/api/save-sales', async (req, res) => {
  try {
    const formData = req.body;
    // Implement save logic similar to bigquerySales.js:saveSalesData
    // Example: Insert into SalesData, PaymentData, Balance_Due
    res.json({ status: 'success', message: 'Sales data saved' });
  } catch (error) {
    console.error('Error saving sales:', error);
    res.status(500).json({ error: 'Failed to save sales data' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});