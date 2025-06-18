const { BigQuery } = require('@google-cloud/bigquery');
const { v4: uuidv4 } = require('uuid');

const bigquery = new BigQuery();

async function insertSalesData(data, email) {
  const datasetId = 'my_database';
  const salesTableId = 'SYJPMOPMHSalesData';
  const billNumbersTableId = 'SYJPMOPMHBillNumbers';
  const timestamp = BigQuery.timestamp(new Date());
  const saleDataId = uuidv4();

  const salesRows = [];
  data.items.forEach(item => {
    if (item.item && item.amount) {
      salesRows.push({
        SaleData_ID: saleDataId,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: data.shopName,
        Department: data.department,
        Mobile_Number: data.mobileNumber || null,
        Item: item.item,
        Amount: parseFloat(item.amount) || null,
        RMD_CSTM: item.rmdCstm || null,
        Paymode: null,
        Amount_Received: null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  data.payments.forEach(payment => {
    if (payment.paymode && payment.amountReceived) {
      salesRows.push({
        SaleData_ID: saleDataId,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: data.shopName,
        Department: data.department,
        Mobile_Number: data.mobileNumber || null,
        Item: null,
        Amount: null,
        RMD_CSTM: null,
        Paymode: payment.paymode,
        Amount_Received: parseFloat(payment.amountReceived) || null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  const billNumberRow = [{
    Bill_Number: data.billNumber,
    Date: data.date,
    Timestamp: timestamp
  }];

  await bigquery.dataset(datasetId).table(salesTableId).insert(salesRows);
  await bigquery.dataset(datasetId).table(billNumbersTableId).insert(billNumberRow);
  return salesRows.length + billNumberRow.length;
}

async function insertDueBalanceData(data, email) {
  const datasetId = 'my_database';
  const balanceDueTableId = 'SYJPMOPMHBalanceDue';
  const billNumbersTableId = 'SYJPMOPMHBillNumbers';
  const timestamp = BigQuery.timestamp(new Date());
  const balanceDueId = uuidv4();

  const dueBalanceRows = [];
  data.dueBalanceRows.forEach(row => {
    if (row.dueBalanceReceived || row.dueBalanceBillNumber) {
      dueBalanceRows.push({
        BalanceDue_ID: balanceDueId,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: data.shopName,
        Department: data.department,
        Mobile_Number: data.mobileNumber || null,
        Due_Balance_Received: row.dueBalanceReceived || null, // Keep as STRING
        Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  const billNumberRow = [{
    Bill_Number: data.billNumber,
    Date: data.date,
    Timestamp: timestamp
  }];

  await bigquery.dataset(datasetId).table(balanceDueTableId).insert(dueBalanceRows);
  await bigquery.dataset(datasetId).table(billNumbersTableId).insert(billNumberRow);
  return dueBalanceRows.length + billNumberRow.length;
}

async function updateSalesData(data, email) {
  const datasetId = 'my_database';
  const salesTableId = 'SYJPMOPMHSalesData';
  const timestamp = BigQuery.timestamp(new Date());
  const saleDataId = uuidv4();

  await bigquery.query({
    query: `DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHSalesData\`
            WHERE Bill_Number = @billNumber AND Date = @date`,
    params: { billNumber: data.billNumber, date: data.date }
  });

  const salesRows = [];
  data.items.forEach(item => {
    if (item.item && item.amount) {
      salesRows.push({
        SaleData_ID: saleDataId,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: data.shopName,
        Department: data.department,
        Mobile_Number: data.mobileNumber || null,
        Item: item.item,
        Amount: parseFloat(item.amount) || null,
        RMD_CSTM: item.rmdCstm || null,
        Paymode: null,
        Amount_Received: null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  data.payments.forEach(payment => {
    if (payment.paymode && payment.amountReceived) {
      salesRows.push({
        SaleData_ID: saleDataId,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: data.shopName,
        Department: data.department,
        Mobile_Number: data.mobileNumber || null,
        Item: null,
        Amount: null,
        RMD_CSTM: null,
        Paymode: payment.paymode,
        Amount_Received: parseFloat(payment.amountReceived) || null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  await bigquery.dataset(datasetId).table(salesTableId).insert(salesRows);
  return salesRows.length;
}

async function updateDueBalanceData(data, email) {
  const datasetId = 'my_database';
  const balanceDueTableId = 'SYJPMOPMHBalanceDue';
  const timestamp = BigQuery.timestamp(new Date());
  const balanceDueId = uuidv4();

  await bigquery.query({
    query: `DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHBalanceDue\`
            WHERE Bill_Number = @billNumber AND Date = @date`,
    params: { billNumber: data.billNumber, date: data.date }
  });

  const dueBalanceRows = [];
  data.dueBalanceRows.forEach(row => {
    if (row.dueBalanceReceived || row.dueBalanceBillNumber) {
      dueBalanceRows.push({
        BalanceDue_ID: balanceDueId,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: data.shopName,
        Department: data.department,
        Mobile_Number: data.mobileNumber || null,
        Due_Balance_Received: row.dueBalanceReceived || null, // Keep as STRING
        Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  await bigquery.dataset(datasetId).table(balanceDueTableId).insert(dueBalanceRows);
  return dueBalanceRows.length;
}

async function checkDuplicateBillNumber(billNumber, date) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHBillNumbers\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const options = {
    query,
    params: { billNumber, date }
  };
  const [rows] = await bigquery.query(options);
  return rows[0].count > 0;
}

async function getNames() {
  const queries = {
    salesmen: 'SELECT DISTINCT Salesman FROM `myposdata.my_database.SalesData` WHERE Salesman IS NOT NULL',
    shopNames: 'SELECT shop_name AS Shop_Name FROM `myposdata.my_database.SalesShopName`',
    departments: 'SELECT department AS Department FROM `myposdata.my_database.SalesDepartment`',
    items: 'SELECT Item FROM `myposdata.my_database.Items`',
    rmdCstms: 'SELECT rmd_cstm AS RMD_CSTM FROM `myposdata.my_database.SalesRmdCstm`',
    paymodes: 'SELECT Paymode FROM `myposdata.my_database.Paymode`'
  };
  const results = {};
  for (const [key, query] of Object.entries(queries)) {
    const [rows] = await bigquery.query(query);
    results[key] = rows.map(row => Object.values(row)[0]);
  }
  return results;
}

async function getRecentSales() {
  const query = `
    SELECT DISTINCT Date, Bill_Number
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHSalesData\`
    ORDER BY Date DESC
    LIMIT 10
  `;
  const [rows] = await bigquery.query(query);
  return rows;
}

async function getRecentDueBalances() {
  const query = `
    SELECT DISTINCT Date, Bill_Number
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHBalanceDue\`
    ORDER BY Date DESC
    LIMIT 10
  `;
  const [rows] = await bigquery.query(options);
  return rows;
}

async function getSalesData(billNumber, date) {
  const query = `
    SELECT *
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHSalesData\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const options = {
    query,
    params: { billNumber, date }
  };
  const [rows] = await bigquery.query(options);
  return { salesData: rows };
}

async function getDueBalanceData(billNumber, date) {
  const query = `
    SELECT *
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHBalanceDue\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const options = {
    query,
    params: { billNumber, date }
  };
  const [rows] = await bigquery.query(options);
  return { dueBalanceData: rows };
}

module.exports = {
  insertSalesData,
  insertDueBalanceData,
  checkDuplicateBillNumber,
  getNames,
  getRecentSales,
  getRecentDueBalances,
  getSalesData,
  getDueBalanceData,
  updateSalesData,
  updateDueBalanceData
};