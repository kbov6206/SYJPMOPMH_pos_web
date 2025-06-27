const functions = require('@google-cloud/functions-framework');
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

functions.http('sales', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const { action } = req.query;

  if (req.path === '/getRecentEntries' && req.method === 'GET') {
    const { table, email, limit = 100 } = req.query;
    if (!table || !email) {
      return res.status(400).json({ error: 'Missing table or email parameter' });
    }

    try {
      const query = `
        SELECT *
        FROM \`${table}\`
        WHERE User_Email = @email
        ORDER BY Date DESC
        LIMIT @limit
      `;
      const options = {
        query,
        params: { email, limit: parseInt(limit) },
      };
      const [rows] = await bigquery.query(options);
      return res.status(200).json({ rows });
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  if (req.path === '/insertSale' && req.method === 'POST') {
    const { Date, Bill_Number, Amount_Received, Paymode, Items, Department, User_Email } = req.body;
    if (!Date || !Bill_Number || !Amount_Received || !Paymode || !Items || !Department || !User_Email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const datasetId = 'my_database';
      const tableId = 'SYJPMOPMHSalesData';
      const row = {
        Date,
        Bill_Number,
        Amount_Received: parseFloat(Amount_Received),
        Paymode,
        Items,
        Department,
        User_Email,
      };

      await bigquery.dataset(datasetId).table(tableId).insert([row]);
      return res.status(200).json({ message: 'Sale inserted successfully' });
    } catch (error) {
      console.error('Error inserting sale:', error);
      return res.status(500).json({ error: 'Failed to insert sale' });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
});
