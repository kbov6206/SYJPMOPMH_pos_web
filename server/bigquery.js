const { BigQuery } = require('@google-cloud/bigquery');
const config = require('./config');

const bigquery = new BigQuery({
  projectId: config.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function executeQuery(query, parameters = {}) {
  try {
    const [rows] = await bigquery.query({ query, params: parameters });
    return rows;
  } catch (error) {
    console.error('BigQuery error:', error);
    throw error;
  }
}

async function getRecentSales() {
  const query = `
    SELECT
      s.Bill_Number,
      s.Date,
      s.Salesman,
      s.Shop_Name,
      s.Department,
      s.Mobile_Number,
      SUM(s.Amount) as Total_Amount
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SYJPMOPMHSalesData\` s
    GROUP BY s.Bill_Number, s.Date, s.Salesman, s.Shop_Name, s.Department, s.Mobile_Number
    ORDER BY s.Date DESC
    LIMIT 10
  `;
  return executeQuery(query);
}

async function getSalesmen() {
  const query = `
    SELECT DISTINCT Salesman
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.NamesForSale\`
    WHERE Salesman IS NOT NULL
  `;
  return executeQuery(query).then(rows => rows.map(row => row.Salesman));
}

async function getShopNames() {
  const query = `
    SELECT DISTINCT shop_name
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesShopName\`
    WHERE shop_name IS NOT NULL
  `;
  return executeQuery(query).then(rows => rows.map(row => row.shop_name));
}

async function getItems() {
  const query = `
    SELECT DISTINCT Item
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.Items\`
    WHERE Item IS NOT NULL
  `;
  return executeQuery(query).then(rows => rows.map(row => row.Item));
}

async function getPaymodes() {
  const query = `
    SELECT DISTINCT Paymode
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.Paymode\`
    WHERE Paymode IS NOT NULL
  `;
  return executeQuery(query).then(rows => rows.map(row => row.Paymode));
}

async function getRmdCstm() {
  const query = `
    SELECT DISTINCT rmd_cstm
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SalesRmdCstm\`
    WHERE rmd_cstm IS NOT NULL
  `;
  return executeQuery(query).then(rows => rows.map(row => row.rmd_cstm));
}

async function getRecentDueBalance() {
  const query = `
    SELECT
      b.Bill_Number,
      b.Date,
      SUM(s.Amount) - SUM(COALESCE(p.Amount_Received, 0)) as Balance_Due
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SYJPMOPMHSalesData\` s
    LEFT JOIN \`${config.PROJECT_ID}.${config.DATASET_ID}.SYJPMOPMHPaymentData\` p
      ON s.Bill_Number = p.Bill_Number AND s.Date = p.Date
    LEFT JOIN \`${config.PROJECT_ID}.${config.DATASET_ID}.SYJPMOPMHBalanceDue\` b
      ON s.Bill_Number = b.Bill_Number AND s.Date = b.Date
    GROUP BY b.Bill_Number, b.Date
    HAVING Balance_Due > 0
    ORDER BY b.Date DESC
    LIMIT 10
  `;
  return executeQuery(query);
}

async function checkDuplicateBillNumber(billNumber, date) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${config.PROJECT_ID}.${config.DATASET_ID}.SYJPMOPMHBillNumbers\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const rows = await executeQuery(query, { billNumber, date });
  return { isDuplicate: rows[0].count > 0 };
}

async function insertSalesData(salesData, balanceDueData, billNumbersData, paymentData) {
  const dataset = bigquery.dataset(config.DATASET_ID);
  const salesTable = dataset.table('SYJPMOPMHSalesData');
  const paymentTable = dataset.table('SYJPMOPMHPaymentData');
  const billNumbersTable = dataset.table('SYJPMOPMHBillNumbers');
  const balanceDueTable = dataset.table('SYJPMOPMHBalanceDue');

  const insertOptions = { skipInvalidRows: false, ignoreUnknownValues: false };

  await Promise.all([
    salesData.length > 0 ? salesTable.insert(salesData, insertOptions) : Promise.resolve(),
    paymentData.length > 0 ? paymentTable.insert(paymentData, insertOptions) : Promise.resolve(),
    billNumbersData.length > 0 ? billNumbersTable.insert(billNumbersData, insertOptions) : Promise.resolve(),
    balanceDueData.length > 0 ? balanceDueTable.insert(balanceDueData, insertOptions) : Promise.resolve(),
  ]);
}

module.exports = {
  getRecentSales,
  getSalesmen,
  getShopNames,
  getItems,
  getPaymodes,
  getRmdCstm,
  getRecentDueBalance,
  checkDuplicateBillNumber,
  insertSalesData,
};