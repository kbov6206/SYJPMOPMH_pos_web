     const express = require('express');
     const cors = require('cors');
     const { insertSalesData, insertDueBalanceData, getRecentSales, getRecentDueBalances, getNames, updateSalesData, updateDueBalanceData, getSalesData, getDueBalanceData, checkDuplicateBillNumber } = require('./api/bigquery.js');
     const path = require('path');

     const app = express();
     app.use(express.json({ limit: '50mb' }));
     app.use(cors({
       origin: ['https://kbov6206.github.io', 'https://sy-jpm-pos-web-uc.a.run.app']
     }));

     app.use(express.static(path.join(__dirname, '../public')));

     app.get('/', async (req, res) => {
       res.sendFile(path.join(__dirname, '../public/index.html'));
     });

     app.get('/api/names', async (req, res) => {
       try {
         const names = await getNames();
         res.json(names);
       } catch (error) {
         console.error('Error fetching names:', error);
         res.status(500).json({ error: 'Failed to fetch names' });
       }
     });

     app.get('/api/recent-sales', async (req, res) => {
       try {
         const salesData = await getRecentSales();
         res.json(salesData);
       } catch (error) {
         console.error('Error fetching recent sales:', error);
         res.status(500).json({ error: 'Failed to fetch recent sales' });
       }
     });

     app.get('/api/recent-due-balances', async (req, res) => {
       try {
         const dueBalanceData = await getRecentDueBalances();
         res.json(dueBalanceData);
       } catch (error) {
         console.error('Error fetching recent due balances:', error);
         res.status(500).json({ error: 'Failed to fetch recent due balances' });
       }
     });

     app.post('/api/sales', async (req, res) => {
       try {
         const data = req.body;
         const result = await insertSalesData(data);
         res.json({ message: 'Sales data inserted successfully', result });
       } catch (error) {
         console.error('Error inserting sales data:', error);
         res.status(500).json({ error: 'Failed to insert sales data' });
       }
     });

     app.put('/api/sales/update', async (req, res) => {
       try {
         const data = req.body;
         const result = await updateSalesData(data);
         res.json({ message: 'Sales data updated successfully', result });
       } catch (error) {
         console.error('Error updating sales data:', error);
         res.status(500).json({ error: 'Failed to update sales data' });
       }
     });

     app.post('/api/due-balance', async (req, res) => {
       try {
         const data = req.body;
         const result = await insertDueBalanceData(data);
         res.json({ message: 'Due balance data inserted successfully', result });
       } catch (error) {
         console.error('Error inserting due balance data:', error);
         res.status(500).json({ error: 'Failed to insert due balance data' });
       }
     });

     app.put('/api/due-balance/update', async (req, res) => {
       try {
         const data = req.body;
         const result = await updateDueBalanceData(data);
         res.json({ message: 'Due balance data updated successfully', result });
       } catch (error) {
         console.error('Error updating due balance data:', error);
         res.status(500).json({ error: 'Failed to update due balance data' });
       }
     });

     app.get('/api/sales', async (req, res) => {
       try {
         const { billNumber, date } = req.query;
         const salesData = await getSalesData(billNumber, date);
         res.json({ salesData });
       } catch (error) {
         console.error('Error fetching sales data:', error);
         res.status(500).json({ error: 'Failed to fetch sales data' });
       }
     });

     app.get('/api/due-balance', async (req, res) => {
       try {
         const { billNumber, date } = req.query;
         const dueBalanceData = await getDueBalanceData(billNumber, date);
         res.json({ dueBalanceData });
       } catch (error) {
         console.error('Error fetching due balance data:', error);
         res.status(500).json({ error: 'Failed to fetch due balance data' });
       }
     });

     app.get('/api/check-duplicate', async (req, res) => {
       try {
         const { billNumber, date } = req.query;
         const isDuplicate = await checkDuplicateBillNumber(billNumber, date);
         res.json({ isDuplicate });
       } catch (error) {
         console.error('Error checking duplicate bill number:', error);
         res.status(500).json({ error: 'Failed to check duplicate bill number' });
       }
     });

     const PORT = process.env.PORT || 8080;
     app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
     });