const { BigQuery } = require('@google-cloud/bigquery');
const config = require('./config');

console.log('Initializing BigQuery client with:', {
  projectId: config.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bigqueryClient = new BigQuery({
  projectId: config.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
});

async function executeQuery(query, params = []) {
  const options = { query, params, location: config.LOCATION };
  try {
    console.log('Executing query:', query, 'with params:', params);
    const [rows] = await bigqueryClient.query(options);
    return rows;
  } catch (error) {
    console.error('BigQuery query error:', error);
    throw error;
  }
}

async function getSalesmen() {
  const query = `SELECT DISTINCT Salesman FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesData\``;
  return executeQuery(query);
}

async function getShopNames() {
  const query = `SELECT DISTINCT Shop_Name FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesData\``;
  return executeQuery(query);
}

async function getItems() {
  const query = `SELECT DISTINCT Item FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesData\``;
  return executeQuery(query);
}

async function getPaymodes() {
  const query = `SELECT DISTINCT Paymode FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.PaymentData\` WHERE Paymode IS NOT NULL`;
  return executeQuery(query);
}

async function getRmdCstm() {
  const query = `SELECT DISTINCT RMD_CSTM FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesData\` WHERE RMD_CSTM IS NOT NULL`;
  return executeQuery(query);
}

async function getRecentSales() {
  const query = `
    SELECT Date, Bill_Number, Salesman, Shop_Name, Department, Mobile_Number, Item, Amount
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesData\`
    ORDER BY Timestamp DESC
    LIMIT 10
  `;
  return executeQuery(query);
}

async function getRecentDueBalance() {
  const query = `
    SELECT Date, Bill_Number, Due_Balance_Received, Due_Balance_Bill_Number
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.Balance_Due\`
    WHERE Due_Balance_Received IS NOT NULL
    ORDER BY Timestamp DESC
    LIMIT 10
  `;
  return executeQuery(query);
}

async function checkDuplicateBillNumber(billNumber, date) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.BillNumbers\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const rows = await executeQuery(query, { billNumber, date });
  return { isDuplicate: rows[0].count > 0 };
}

async function insertSalesData(salesData, balanceDueData, billNumbersData, paymentData) {
  try {
    console.log('Inserting data:', { salesData, balanceDueData, billNumbersData, paymentData });
    await Promise.all([
      bigqueryClient.dataset(config.DATASET_ID).table('SalesData').insert(salesData),
      bigqueryClient.dataset(config.DATASET_ID).table('Balance_Due').insert(balanceDueData),
      bigqueryClient.dataset(config.DATASET_ID).table('BillNumbers').insert(billNumbersData),
      bigqueryClient.dataset(config.DATASET_ID).table('PaymentData').insert(paymentData),
    ]);
  } catch (error) {
    console.error('BigQuery insert error:', error);
    throw error;
  }
}

module.exports = {
  getSalesmen,
  getShopNames,
  getItems,
  getPaymodes,
  getRmdCstm,
  getRecentSales,
  getRecentDueBalance,
  checkDuplicateBillNumber,
  insertSalesData,
};