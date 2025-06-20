const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'myposdata',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? process.env.GOOGLE_APPLICATION_CREDENTIALS
    : path.join(__dirname, 'credentials.json'),
});

const datasetId = 'my_database';

async function insertSalesData(data) {
  try {
    const tableId = 'SYJPMOPMHSalesData';
    const rows = data.items.flatMap(item => {
      const baseRow = {
        Date: data.date || null,
        Bill_Number: data.billNumber || null,
        Salesman: data.salesman || null,
        Shop_Name: data.shopName || null,
        Department: data.department || null,
        Mobile_Number: data.mobileNumber || null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Email_ID: 'reachadeel@gmail.com',
        Timestamp: BigQuery.timestamp(new Date()),
      };
      return (data.payments || []).map(payment => ({
        ...baseRow,
        Item: item.item || null,
        Amount: parseFloat(item.amount) || null,
        RMD_CSTM: item.rmdCstm || null,
        Paymode: payment.paymode || null,
        Amount_Received: parseFloat(payment.amountReceived) || null,
      }));
    });

    if (rows.length === 0) throw new Error('No rows to insert');

    await bigquery.dataset(datasetId).table(tableId).insert(rows);

    await bigquery.dataset(datasetId).table('SYJPMOPMHBillNumbers').insert({
      Date: data.date || null,
      Bill_Number: data.billNumber || null,
      Email_ID: 'reachadeel@gmail.com',
      Timestamp: BigQuery.timestamp(new Date()),
    });

    return { insertedRows: rows.length };
  } catch (error) {
    console.error('InsertSalesData Error:', error.message, error.stack);
    throw error;
  }
}

async function insertDueBalanceData(data) {
  try {
    const tableId = 'SYJPMOPMHBalanceDue';
    const rows = (data.dueBalanceRows || []).map(row => ({
      Date: data.date || null,
      Bill_Number: data.billNumber || null,
      Salesman: data.salesman || null,
      Shop_Name: data.shopName || null,
      Department: data.department || null,
      Mobile_Number: data.mobileNumber || null,
      Due_Balance_Received: parseFloat(row.dueBalanceReceived) || null,
      Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
      Email_ID: 'reachadeel@gmail.com',
      Timestamp: BigQuery.timestamp(new Date()),
    }));

    if (rows.length === 0) throw new Error('No rows to insert');

    await bigquery.dataset(datasetId).table(tableId).insert(rows);

    await bigquery.dataset(datasetId).table('SYJPMOPMHBillNumbers').insert({
      Date: data.date || null,
      Bill_Number: data.billNumber || null,
      Email_ID: 'reachadeel@gmail.com',
      Timestamp: BigQuery.timestamp(new Date()),
    });

    return { insertedRows: rows.length };
  } catch (error) {
    console.error('InsertDueBalanceData Error:', error.message, error.stack);
    throw error;
  }
}

async function getRecentSales() {
  try {
    const query = `
      SELECT DISTINCT Date, Bill_Number
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHSalesData\`
      WHERE Email_ID = 'reachadeel@gmail.com'
      ORDER BY Timestamp DESC
      LIMIT 10
    `;
    const [rows] = await bigquery.query(query);
    return rows;
  } catch (error) {
    console.error('GetRecentSales Error:', error.message, error.stack);
    throw error;
  }
}

async function getRecentDueBalances() {
  try {
    const query = `
      SELECT DISTINCT Date, Bill_Number
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHBalanceDue\`
      WHERE Email_ID = 'reachadeel@gmail.com'
      ORDER BY Timestamp DESC
      LIMIT 10
    `;
    const [rows] = await bigquery.query(query);
    return rows;
  } catch (error) {
    console.error('GetRecentDueBalances Error:', error.message, error.stack);
    throw error;
  }
}

async function getNames() {
  try {
    const salesmenQuery = `SELECT DISTINCT Salesman FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesData\` WHERE Salesman IS NOT NULL ORDER BY Salesman`;
    const shopNamesQuery = `SELECT DISTINCT shop_name FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesShopName\` WHERE shop_name IS NOT NULL ORDER BY shop_name`;
    const departmentsQuery = `SELECT DISTINCT department FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesDepartment\` WHERE department IS NOT NULL ORDER BY department`;
    const itemsQuery = `SELECT DISTINCT Item FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.Items\` WHERE Item IS NOT NULL ORDER BY Item`;
    const rmdCstmsQuery = `SELECT DISTINCT rmd_cstm FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesRmdCstm\` WHERE rmd_cstm IS NOT NULL ORDER BY rmd_cstm`;
    const paymodesQuery = `SELECT DISTINCT Paymode FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.Paymode\` WHERE Paymode IS NOT NULL ORDER BY Paymode`;

    const [[salesmen], [shopNames], [departments], [items], [rmdCstms], [paymodes]] = await Promise.all([
      bigquery.query(salesmenQuery),
      bigquery.query(shopNamesQuery),
      bigquery.query(departmentsQuery),
      bigquery.query(itemsQuery),
      bigquery.query(rmdCstmsQuery),
      bigquery.query(paymodesQuery),
    ]);

    return {
      salesmen: salesmen.map(row => row.Salesman),
      shopNames: shopNames.map(row => row.shop_name),
      departments: departments.map(row => row.department),
      items: items.map(row => row.Item),
      rmdCstms: rmdCstms.map(row => row.rmd_cstm),
      paymodes: paymodes.map(row => row.Paymode),
    };
  } catch (error) {
    console.error('GetNames Error:', error.message, error.stack);
    throw error;
  }
}

async function updateSalesData(data) {
  try {
    const tableId = 'SYJPMOPMHSalesData';
    const deleteQuery = `
      DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.${tableId}\`
      WHERE Bill_Number = @billNumber AND Date = @date AND Email_ID = 'reachadeel@gmail.com'
    `;
    await bigquery.query({
      query: deleteQuery,
      params: { billNumber: data.billNumber, date: data.date },
    });

    const rows = data.items.flatMap(item => {
      const baseRow = {
        Date: data.date || null,
        Bill_Number: data.billNumber || null,
        Salesman: data.salesman || null,
        Shop_Name: data.shopName || null,
        Department: data.department || null,
        Mobile_Number: data.mobileNumber || null,
        Balance_Due: parseFloat(data.balanceDue) || null,
        Delivery_Date: data.deliveryDate || null,
        Email_ID: 'reachadeel@gmail.com',
        Timestamp: BigQuery.timestamp(new Date()),
      };
      return (data.payments || []).map(payment => ({
        ...baseRow,
        Item: item.item || null,
        Amount: parseFloat(item.amount) || null,
        RMD_CSTM: item.rmdCstm || null,
        Paymode: payment.paymode || null,
        Amount_Received: parseFloat(payment.amountReceived) || null,
      }));
    });

    if (rows.length === 0) throw new Error('No rows to insert');

    await bigquery.dataset(datasetId).table(tableId).insert(rows);
    return { updatedRows: rows.length };
  } catch (error) {
    console.error('UpdateSalesData Error:', error.message, error.stack);
    throw error;
  }
}

async function updateDueBalanceData(data) {
  try {
    const tableId = 'SYJPMOPMHBalanceDue';
    const deleteQuery = `
      DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.${tableId}\`
      WHERE Bill_Number = @billNumber AND Date = @date AND Email_ID = 'reachadeel@gmail.com'
    `;
    await bigquery.query({
      query: deleteQuery,
      params: { billNumber: data.billNumber, date: data.date },
    });

    const rows = (data.dueBalanceRows || []).map(row => ({
      Date: data.date || null,
      Bill_Number: data.billNumber || null,
      Salesman: data.salesman || null,
      Shop_Name: data.shopName || null,
      Department: data.department || null,
      Mobile_Number: data.mobileNumber || null,
      Due_Balance_Received: parseFloat(row.dueBalanceReceived) || null,
      Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
      Email_ID: 'reachadeel@gmail.com',
      Timestamp: BigQuery.timestamp(new Date()),
    }));

    if (rows.length === 0) throw new Error('No rows to insert');

    await bigquery.dataset(datasetId).table(tableId).insert(rows);
    return { updatedRows: rows.length };
  } catch (error) {
    console.error('UpdateDueBalanceData Error:', error.message, error.stack);
    throw error;
  }
}

async function getSalesData(billNumber, date) {
  try {
    const query = `
      SELECT *
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHSalesData\`
      WHERE Bill_Number = @billNumber AND Date = @date AND Email_ID = 'reachadeel@gmail.com'
    `;
    const [rows] = await bigquery.query({
      query,
      params: { billNumber, date },
    });
    return rows;
  } catch (error) {
    console.error('GetSalesData Error:', error.message, error.stack);
    throw error;
  }
}

async function getDueBalanceData(billNumber, date) {
  try {
    const query = `
      SELECT *
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHBalanceDue\`
      WHERE Bill_Number = @billNumber AND Date = @date AND Email_ID = 'reachadeel@gmail.com'
    `;
    const [rows] = await bigquery.query({
      query,
      params: { billNumber, date },
    });
    return rows;
  } catch (error) {
    console.error('GetDueBalanceData Error:', error.message, error.stack);
    throw error;
  }
}

async function checkDuplicateBillNumber(billNumber, date) {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHBillNumbers\`
      WHERE Bill_Number = @billNumber AND Date = @date AND Email_ID = 'reachadeel@gmail.com'
    `;
    const [rows] = await bigquery.query({
      query,
      params: { billNumber, date },
    });
    return rows[0].count > 0;
  } catch (error) {
    console.error('CheckDuplicateBillNumber Error:', error.message, error.stack);
    throw error;
  }
}

module.exports = {
  insertSalesData,
  insertDueBalanceData,
  getRecentSales,
  getRecentDueBalances,
  getNames,
  updateSalesData,
  updateDueBalanceData,
  getSalesData,
  getDueBalanceData,
  checkDuplicateBillNumber,
};