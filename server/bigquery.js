const { BigQuery } = require('@google-cloud/bigquery');
const config = require('./config');
const { v4: uuidv4 } = require('uuid');

const bigquery = new BigQuery({
  projectId: config.projectId,
});

async function getRecentSales() {
  const query = `
    SELECT *
    FROM \`${config.projectId}.${config.datasetId}.${config.salesTableId}\`
    WHERE Timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    ORDER BY Timestamp DESC
    LIMIT 100
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows;
  } catch (error) {
    console.error('Error querying recent sales:', error);
    throw error;
  }
}

async function getRecentDueBalance() {
  const query = `
    SELECT *
    FROM \`${config.projectId}.${config.datasetId}.${config.dueBalanceTableId}\`
    WHERE Timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    ORDER BY Timestamp DESC
    LIMIT 10
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows;
  } catch (error) {
    console.error('Error querying recent due balances:', error);
    throw error;
  }
}

async function getSalesmen() {
  const query = `
    SELECT DISTINCT SalesmanName
    FROM \`${config.projectId}.${config.datasetId}.${config.namesForSaleTableId}\`
    WHERE SalesmanName IS NOT NULL
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows.map(row => row.SalesmanName);
  } catch (error) {
    console.error('Error querying salesmen:', error);
    throw error;
  }
}

async function getShopNames() {
  const query = `
    SELECT DISTINCT shop_name
    FROM \`${config.projectId}.${config.datasetId}.${config.shopNameTableId}\`
    WHERE shop_name IS NOT NULL
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows.map(row => row.shop_name);
  } catch (error) {
    console.error('Error querying shop names:', error);
    throw error;
  }
}

async function getItems() {
  const query = `
    SELECT DISTINCT Item
    FROM \`${config.projectId}.${config.datasetId}.${config.itemsTableId}\`
    WHERE Item IS NOT NULL
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows.map(row => row.Item);
  } catch (error) {
    console.error('Error querying items:', error);
    throw error;
  }
}

async function getPaymodes() {
  const query = `
    SELECT DISTINCT Paymode
    FROM \`${config.projectId}.${config.datasetId}.${config.paymodeTableId}\`
    WHERE Paymode IS NOT NULL
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows.map(row => row.Paymode);
  } catch (error) {
    console.error('Error querying paymodes:', error);
    throw error;
  }
}

async function getRmdCstm() {
  const query = `
    SELECT DISTINCT rmd_cstm
    FROM \`${config.projectId}.${config.datasetId}.${config.rmdCstmTableId}\`
    WHERE rmd_cstm IS NOT NULL
  `;
  try {
    const [rows] = await bigquery.query(query);
    return rows.map(row => row.rmd_cstm);
  } catch (error) {
    console.error('Error querying rmd_cstm:', error);
    throw error;
  }
}

async function getSalesByBillNumber(billNumber, date) {
  const query = `
    SELECT *
    FROM \`${config.projectId}.${config.datasetId}.${config.salesTableId}\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const options = {
    query: query,
    params: { billNumber, date },
  };
  try {
    const [rows] = await bigquery.query(options);
    return { salesData: rows };
  } catch (error) {
    console.error('Error querying sales by bill number:', error);
    throw error;
  }
}

async function getDueBalanceByBillNumber(billNumber, date) {
  const query = `
    SELECT *
    FROM \`${config.projectId}.${config.datasetId}.${config.dueBalanceTableId}\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const options = {
    query: query,
    params: { billNumber, date },
  };
  try {
    const [rows] = await bigquery.query(options);
    return { dueBalanceData: rows };
  } catch (error) {
    console.error('Error querying due balance by bill number:', error);
    throw error;
  }
}

async function checkDuplicateBillNumber(billNumber, date) {
  const query = `
    SELECT COUNT(*) AS count
    FROM \`${config.projectId}.${config.datasetId}.${config.billNumbersTableId}\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const options = {
    query: query,
    params: { billNumber, date },
  };
  try {
    const [rows] = await bigquery.query(options);
    return { isDuplicate: rows[0].count > 0 };
  } catch (error) {
    console.error('Error checking duplicate bill number:', error);
    throw error;
  }
}

async function insertSalesData(salesData, balanceDueData, billNumbersData, paymentData) {
  const dataset = bigquery.dataset(config.datasetId);

  // Validate and format sales data
  const formattedSalesData = salesData.map(row => {
    if (!row.Bill_Number || !row.Salesman || !row.Shop_Name || !row.Email_ID) {
      throw new Error('Missing required fields in SalesData');
    }
    return {
      SaleData_ID: row.SaleData_ID || uuidv4(),
      Date: row.Date || new Date().toISOString().split('T')[0],
      Bill_Number: row.Bill_Number,
      Salesman: row.Salesman,
      Shop_Name: row.Shop_Name,
      Department: 'SYJ-Gents',
      Mobile_Number: row.Mobile_Number || null,
      Item: row.Item || null,
      Amount: parseFloat(row.Amount) || null,
      RMD_CSTM: row.RMD_CSTM || null,
      Paymode: row.Paymode || null,
      Amount_Received: parseFloat(row.Amount_Received) || null,
      Balance_Due: parseFloat(row.Balance_Due) || null,
      Delivery_Date: row.Delivery_Date || null,
      Timestamp: row.Timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      Email_ID: row.Email_ID,
    };
  });

  // Validate and format balance due data
  const formattedBalanceDueData = balanceDueData.map(row => {
    if (!row.Bill_Number || !row.Salesman || !row.Shop_Name || !row.Email_ID) {
      throw new Error('Missing required fields in BalanceDue');
    }
    return {
      BalanceDue_ID: row.BalanceDue_ID || uuidv4(),
      Date: row.Date || new Date().toISOString().split('T')[0],
      Bill_Number: row.Bill_Number,
      Salesman: row.Salesman,
      Shop_Name: row.Shop_Name,
      Department: 'SYJ-Gents',
      Mobile_Number: row.Mobile_Number || null,
      Due_Balance_Received: parseFloat(row.Due_Balance_Received) || null,
      Due_Balance_Bill_Number: row.Due_Balance_Bill_Number || null,
      Timestamp: row.Timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      Email_ID: row.Email_ID,
    };
  });

  // Validate and format bill numbers data
  const formattedBillNumbersData = billNumbersData.map(row => {
    if (!row.Bill_Number || !row.Date) {
      throw new Error('Missing required fields in BillNumbers');
    }
    return {
      Bill_Number: row.Bill_Number,
      Date: row.Date,
      Timestamp: row.Timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  });

  // Validate and format payment data
  const formattedPaymentData = paymentData.map(row => {
    if (!row.Bill_Number) {
      throw new Error('Missing required fields in PaymentData');
    }
    return {
      PaymentData_ID: row.PaymentData_ID || uuidv4(),
      Date: row.Date || new Date().toISOString().split('T')[0],
      Bill_Number: row.Bill_Number,
      Amount_Received: parseFloat(row.Amount_Received) || null,
      Paymode: row.Paymode || null,
      Timestamp: row.Timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  });

  try {
    const salesTable = dataset.table(config.salesTableId);
    const dueBalanceTable = dataset.table(config.dueBalanceTableId);
    const billNumbersTable = dataset.table(config.billNumbersTableId);
    const paymentTable = dataset.table(config.paymentTableId);

    if (formattedSalesData.length > 0) {
      await salesTable.insert(formattedSalesData);
    }
    if (formattedBalanceDueData.length > 0) {
      await dueBalanceTable.insert(formattedBalanceDueData);
    }
    if (formattedBillNumbersData.length > 0) {
      await billNumbersTable.insert(formattedBillNumbersData);
    }
    if (formattedPaymentData.length > 0) {
      await paymentTable.insert(formattedPaymentData);
    }
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}

async function updateSalesData(salesData, balanceDueData, billNumbersData, paymentData) {
  const dataset = bigquery.dataset(config.datasetId);

  try {
    // Delete existing data for the bill number and date
    const deleteSalesQuery = `
      DELETE FROM \`${config.projectId}.${config.datasetId}.${config.salesTableId}\`
      WHERE Bill_Number = @billNumber AND Date = @date
    `;
    const deleteBalanceDueQuery = `
      DELETE FROM \`${config.projectId}.${config.datasetId}.${config.dueBalanceTableId}\`
      WHERE Bill_Number = @billNumber AND Date = @date
    `;
    const deleteBillNumbersQuery = `
      DELETE FROM \`${config.projectId}.${config.datasetId}.${config.billNumbersTableId}\`
      WHERE Bill_Number = @billNumber AND Date = @date
    `;
    const deletePaymentQuery = `
      DELETE FROM \`${config.projectId}.${config.datasetId}.${config.paymentTableId}\`
      WHERE Bill_Number = @billNumber AND Date = @date
    `;
    const billNumber = salesData[0]?.Bill_Number || balanceDueData[0]?.Bill_Number;
    const date = salesData[0]?.Date || balanceDueData[0]?.Date;
    if (!billNumber || !date) {
      throw new Error('Missing bill number or date for update');
    }

    const deleteOptions = {
      params: { billNumber, date },
    };
    await Promise.all([
      bigquery.query({ query: deleteSalesQuery, ...deleteOptions }),
      bigquery.query({ query: deleteBalanceDueQuery, ...deleteOptions }),
      bigquery.query({ query: deleteBillNumbersQuery, ...deleteOptions }),
      bigquery.query({ query: deletePaymentQuery, ...deleteOptions }),
    ]);

    // Insert new data
    await insertSalesData(salesData, balanceDueData, billNumbersData, paymentData);
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
}

module.exports = {
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
};