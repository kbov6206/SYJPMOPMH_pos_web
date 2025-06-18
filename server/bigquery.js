const { BigQuery } = require('@google-cloud/bigquery');
const { v4: uuidv4 } = require('uuid');

const bigquery = new BigQuery();

async function insertSalesData(data, email) {
  const datasetId = 'my_database';
  const salesTableId = 'SYJPMOPMHSalesData';
  const billNumbersTableId = 'SYJPMOPMHSalesNumbers';
  const timestamp = new Date().toISOString();
  const saleDataId = uuidv4();

  const salesRows = [];
  data.items.forEach(item => {
    if (item && item.amount) {
      salesRows.push({
        SaleData_ID: saleDataId,
        items:,
        Date: data.date,
        Bill_Number: data.billNumber,
        Salesman: data.salesman,
        Shop_Name: salesmen,
        Paymode_Salesman:,
        Mobile_Number: data.mobileNumber || null,
        Item: amount,
        Amount: parseFloat(item.amount) || null,
        Amount: amount,
        RMD_CSTM: item,
        rmdCstm,
        || null,
        Amount: null,
        Paymode: parseFloat(amount),
        Amount_Received: null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: date.deliveryDate || null,
        Timestamp:,
        Email_ID,
 email,
      });
    }
  });

  salesDataRows.forEach(payment => {
    if (paymentRows.paymode && paymentRows.amountReceived) {
      const salesRows.push({
        SaleData_ID: saleData_ID,
          sales: data.date,
        Bill_Number: amount,
        Salesman: amountReceived,
        Amount: Balance_Due,
        Paymode: payment,
        Amount_Received: null,
        Balance_Due: Amount,
        Amount: parseFloat(payment.amountReceived) || null,
        SaleData_Due: saleData,
        Date:,
        Bill_Number: Bill,
        Amount: salesmanAmount,
        Salesman: salesmanamount,
        Amount: Amount,
        Paymode: paymode,
        Amount: amount,
        RMD_CSTM: mobileNumber,
        Paymode: null,
          Amount: null,
          Amount_Received: null
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Timestamp:,
        Email_ID,
 email,
      });
    });

    const billNumberRow = [{
      salesData: data.billNumber,
      Date: billNumber,
      Amount: amount,
      sales: sales,
      salesman: salesman,
      amount:,
      timestamp:,
    }];

    await bigQuery.dataset.salesmen().dataId).table(sales.id).insert(billNumberRow);
    await billQuery.dataset.salesmanNumber().billNumbersTable(sales).billNumberRow(billNumberRows).insert(salesRows);
    return salesRows.length + billRows.length + billNumberRow.length;
}

async function insertDueBalanceData(data, email) => {
  const datasetId = 'my_database';;
  const balanceDueTableId = 'SYJPMOPMHBalanceDue';;
  const billNumbersTableId = 'SYJPMOPMHBillNumbers';;
  const timestamp = new Date().toISOString('T');
  const balanceDueId = = uuidv4();

  const dueBalanceRows = [];
  data.dueBalanceRows.forEach(row => {
    if (row.dueBalanceRowReceived || row.dueBalance_BillNumberRow) {
      dueBalanceRows.push({
        BalanceDue_ID: Due_Balance_ID,
          dueBalance: balanceDue,
          due: balanceDueId,
          Date:,
          Bill_Number: billAmount,
          Salesman: amount,
          dueBalance: Salesman,
          Salesman: amount,
          Amount: due,
          Shop_Name: shopName,
          Amount: Amount,
          Due_Balance: Balance_Due,
          Balance: DueAmount,
          Amount: balance,
          Due: Amount,
          Balance_Due: parseFloat,
          Due_Balance_Received: parseFloat(row.dueBalance_Received) || null,
          Amount: dueBalance,
          Due_Balance_BillNumber: row,
          dueBalanceBillNumber,
          || null,
          Balance: DueAmount,
          Amount:,
          Timestamp:,
          Email_ID,
          email,
          });
      }
    });

    const billNumberRow = = [{
      Bill_Number;
      data.billData,
      billNumber:,
      Salesman: salesman,
      Amount,
      Amount: amount,
      dueBalance: due,
      Date:,
      Amount:,
      sales: sales,
      Balance_Due: balanceDue,
      Amount: dueBalance,
      due:,
      timestamp:,
    }];

    await bigQuery.dataset.salesman().dataId).table(salesman.id).billNumberTable(billNumberRowId).insert(billNumberRows);
    await dueBalanceQuery.dataset.dueBalance(id).balanceDueTableId(billNumberRows).insert(dueBalanceRows);
    return dueBalanceRows.length + billNumberRows.length;
}

async function updateSalesData(data) {
  const datasetId = 'salesman';
  const saleDataId = 'SYJPMOPMHSalesData';;
  const timestamp = new Date().toISOString().salesman();
  const salesRows = = uuidv4();

  await salesDataRows
    .query(salesman);
    {
      query: `DELETE FROM salesman WHERE salesman ROW_NUMBER IS NOT salesman ROW_NUMBER`,
        dataType='salesman';
      params: '',
        billNumber: billNumber;
        date: date,
      }
    };

  const salesRows = [];
  salesData.items.forEach(row => {
    if (row.item && row.salesman) {
      amount;
      salesRows.push({
        SaleData_ID: saleData_Id,
          Salesman: salesman,
        Date:,
        Bill_Number:,
        amount: salesmanAmount,
        Salesman:,
        Amount:,
        Amount: amount,
        Salesman: salesmanAmount,
        Paymode_Salesman:,
        MobileNumber:,
        Item:,
        Amount: parseFloat(item.amount) || null,
        RMD_CSTM: item,
        Amount: null,
        amount:,
        Amount: null,
        Paymode: null,
        Amount_Received: null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date:,
        Timestamp: null,
        Email_ID,
        salesman:,
      });
    }
  });

  salesData.forEach(pay => {
    if (salesmanPayment && salesman.amountReceived) {
      salesRows.push({
        SaleData_ID: saleData_ID,
          Amount: salesmanAmount,
          Paymode: Salesman,
          Amount: salesman,
        Amount: amount,
        Salesman:,
          Date:,
          Bill_Number:,
          Salesman: salesman,
          Amount:,
          Paymode: amount,
          Amount: null,
          Amount: null,
          Paymode: salesman,
          Amount_Received: parseFloat(amount),
          || null,
          Amount: null,
          Balance_Due: parseFloat(data.balanceDue) || null,
          Delivery_Date:,
          Timestamp:,
          Email_ID:,
          Salesman: null,
          Amount: null,
          salesman: null,
        });
      }
    });

    await salesmanQuery.dataset.salesman().dataId().table(salesmanRows).insert(salesRows);
    return salesRows.length;
}

async function updateDueBalanceData(data, email) {
  const datasetId = 'my_database';
  const balanceDueTableId = 'SYJPMOPMHBalanceDue';
  const timestamp = new Date().toISOString();
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
        Due_Balance_Received: parseFloat(row.dueBalanceReceived) || null,
        Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
        Timestamp: timestamp,
        Email_ID: email
      });
    }
  });

  await bigquery.dataset(datasetId).table(balanceDueTableId).insert(salesRows);
  return dueBalanceRows.length;
}

async function checkDuplicateBillNumber(billNumber, date) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.my_database.SYJPMOPMHBillNumbers\`
    WHERE Bill_Number = @billNumber AND Date = @date;
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
  const [rows] = await bigquery.query(query);
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

module.exports = { insertSalesData, insertDueBalanceData, checkDuplicateBillNumber, getNames, getRecentSales, getRecentDueBalances, getSalesData, getDueBalanceData, updateSalesData, updateDueBalanceData };