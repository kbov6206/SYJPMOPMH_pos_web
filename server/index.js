const functions = require('@google-cloud/functions-framework');
const { BigQuery } = require('@google-cloud/bigquery');

const PROJECT_ID = 'myposdata';
const DATASET_ID = 'my_database';
const LOCATION = 'US';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

function serializeDates(obj, seen = new WeakSet()) {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) return null;
    seen.add(obj);
  }
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(item => serializeDates(item, seen));
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        if ('value' in obj[key]) {
          result[key] = obj[key].value;
        } else if ('s' in obj[key] && 'e' in obj[key] && 'c' in obj[key]) {
          const decimal = obj[key];
          if (key === 'Amount_Received' || key === 'Amount' || key === 'Amount_Paid' || key === 'Balance_Due' || key === 'Due_Balance_Received') {
            const sign = decimal.s || 1;
            const exponent = decimal.e || 0;
            const coefficient = decimal.c ? parseInt(decimal.c.join('')) : 0;
            result[key] = sign * coefficient * Math.pow(10, exponent - (decimal.c ? decimal.c.length - 1 : 0));
          } else {
            result[key] = obj[key].toString ? obj[key].toString() : obj[key];
          }
        } else {
          result[key] = serializeDates(obj[key], seen);
        }
      } else {
        result[key] = serializeDates(obj[key], seen);
      }
    }
    return result;
  }
  if (typeof obj === 'string' && !isNaN(obj) && !isNaN(parseFloat(obj))) {
    return parseFloat(obj);
  }
  if (obj === undefined || typeof obj === 'function' || typeof obj === 'symbol') return null;
  return obj;
}

async function executeQuery(query, parameters = []) {
  const options = {
    query: query,
    location: LOCATION,
    params: parameters.reduce((acc, param) => {
      acc[param.name] = param.parameterValue.value;
      return acc;
    }, {})
  };
  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  return { rows: rows.map(row => serializeDates(row)) };
}

async function authenticateUser(email, password) {
  const query = `
    SELECT email, role
    FROM \`${PROJECT_ID}.${DATASET_ID}.users\`
    WHERE email = @email AND role = @password
  `;
  const params = [
    { name: 'email', parameterType: { type: 'STRING' }, parameterValue: { value: email } },
    { name: 'password', parameterType: { type: 'STRING' }, parameterValue: { value: password } }
  ];
  const result = await executeQuery(query, params);
  if (result.rows.length === 0) return { isAuthenticated: false };
  const privilegesQuery = `
    SELECT insert
    FROM \`${PROJECT_ID}.${DATASET_ID}.privileges\`
    WHERE role = @role AND module = 'Sales'
  `;
  const privParams = [
    { name: 'role', parameterType: { type: 'STRING' }, parameterValue: { value: result.rows[0].role } }
  ];
  const privResult = await executeQuery(privilegesQuery, privParams);
  return {
    isAuthenticated: privResult.rows.length > 0 && privResult.rows[0].insert
  };
}

async function getLastBillNumber() {
  const query = `
    SELECT Bill_Number
    FROM \`${PROJECT_ID}.${DATASET_ID}.SalesData\`
    WHERE Bill_Number IS NOT NULL
    ORDER BY Timestamp DESC
    LIMIT 1
  `;
  const result = await executeQuery(query);
  return result.rows && result.rows.length > 0 ? result.rows[0].Bill_Number : null;
}

async function saveSalesData(formData, userEmail) {
  const {
    date, billNumber, salesman, shopName, department, mobileNumber,
    dueBalanceReceived, dueBalanceBillNumber, balanceDue, deliveryDate,
    data: dynamicData, paymentData
  } = formData;
  if (dueBalanceReceived > 0 && !dueBalanceBillNumber) {
    throw new Error('Due Balance Bill Number is required when Due Balance Received is entered!');
  }
  let totalItems = 0;
  if (dynamicData && Array.isArray(dynamicData)) {
    dynamicData.forEach(item => {
      totalItems += Number(item.amount) || 0;
    });
  }
  let totalAmountReceived = 0;
  if (paymentData && Array.isArray(paymentData)) {
    paymentData.forEach(payment => {
      totalAmountReceived += Number(payment.amountReceived) || 0;
    });
  }
  const calculatedTotal = totalItems + Number(dueBalanceReceived || 0) - Number(balanceDue || 0);
  if (totalAmountReceived !== calculatedTotal) {
    throw new Error(`Amount Received (${totalAmountReceived}) does not match calculated value (${calculatedTotal}).`);
  }
  const timestamp = new Date().toISOString();
  let rowsSaved = 0;
  const salesRows = [];
  const paymentRows = [];
  const billNumberRows = [];
  const balanceDueRows = [];
  if (!dynamicData || dynamicData.length === 0) {
    salesRows.push({
      SaleData_ID: `S${timestamp.replace(/[-:T.]/g, '')}`,
      Date: date,
      Bill_Number: billNumber,
      Salesman: salesman,
      Shop_Name: shopName,
      Department: department,
      Mobile_Number: mobileNumber,
      Item: '',
      Amount: 0,
      RMD_CSTM: '',
      Delivery_Date: deliveryDate || null,
      Amount_Received: totalAmountReceived,
      Paymode: paymentData.map(p => p.paymode).join(', '),
      Timestamp: timestamp,
      Email_ID: userEmail
    });
    billNumberRows.push({
      Bill_Number: billNumber,
      Date: date
    });
    balanceDueRows.push({
      Due_Balance_Bill_Number: dueBalanceBillNumber || billNumber,
      Balance_Due: Number(balanceDue) || 0,
      Due_Balance_Received: Number(dueBalanceReceived) || 0,
      Date: date
    });
    rowsSaved++;
  } else {
    dynamicData.forEach((item, index) => {
      salesRows.push({
        SaleData_ID: `S${timestamp.replace(/[-:T.]/g, '')}${index}`,
        Date: date,
        Bill_Number: billNumber,
        Salesman: salesman,
        Shop_Name: shopName,
        Department: department,
        Mobile_Number: mobileNumber,
        Item: item.item,
        Amount: Number(item.amount) || 0,
        RMD_CSTM: item.rmdCstm,
        Delivery_Date: deliveryDate || null,
        Amount_Received: index === 0 ? totalAmountReceived : 0,
        Paymode: index === 0 ? paymentData.map(p => p.paymode).join(', ') : '',
        Timestamp: timestamp,
        Email_ID: userEmail
      });
      if (index === 0) {
        billNumberRows.push({
          Bill_Number: billNumber,
          Date: date
        });
        balanceDueRows.push({
          Due_Balance_Bill_Number: dueBalanceBillNumber || billNumber,
          Balance_Due: Number(balanceDue) || 0,
          Due_Balance_Received: Number(dueBalanceReceived) || 0,
          Date: date
        });
      }
      rowsSaved++;
    });
  }
  paymentData.forEach((payment, index) => {
    const amountReceived = Number(payment.amountReceived);
    if (isNaN(amountReceived) || amountReceived <= 0) {
      console.warn(`Invalid Amount_Received for payment index ${index}, Bill_Number ${billNumber}:`, payment.amountReceived);
      return;
    }
    paymentRows.push({
      PaymentData_ID: `P${timestamp.replace(/[-:T.]/g, '')}${index}`,
      Date: date,
      Bill_Number: billNumber,
      Amount_Received: amountReceived,
      Paymode: payment.paymode,
      Timestamp: timestamp
    });
  });
  if (paymentRows.length === 0) {
    throw new Error('No valid payment data provided.');
  }
  try {
    if (salesRows.length > 0) await bigquery.dataset(DATASET_ID).table('SalesData').insert(salesRows);
    if (paymentRows.length > 0) await bigquery.dataset(DATASET_ID).table('PaymentData').insert(paymentRows);
    if (billNumberRows.length > 0) await bigquery.dataset(DATASET_ID).table('BillNumbers').insert(billNumberRows);
    if (balanceDueRows.length > 0) await bigquery.dataset(DATASET_ID).table('Balance_Due').insert(balanceDueRows);
  } catch (e) {
    throw new Error('Error saving to BigQuery: ' + e.message);
  }
  return { rowsSaved };
}

async function updateSalesData(formData, userEmail) {
  const {
    date, billNumber, salesman, shopName, department, mobileNumber,
    dueBalanceReceived, dueBalanceBillNumber, balanceDue, deliveryDate,
    data: dynamicData, paymentData
  } = formData;
  if (dueBalanceReceived > 0 && !dueBalanceBillNumber) {
    throw new Error('Due Balance Bill Number is required when Due Balance Received is entered!');
  }
  let totalItems = 0;
  if (dynamicData && Array.isArray(dynamicData)) {
    dynamicData.forEach(item => {
      totalItems += Number(item.amount) || 0;
    });
  }
  let totalAmountReceived = 0;
  if (paymentData && Array.isArray(paymentData)) {
    paymentData.forEach(payment => {
      totalAmountReceived += Number(payment.amountReceived) || 0;
    });
  }
  const calculatedTotal = totalItems + Number(dueBalanceReceived || 0) - Number(balanceDue || 0);
  if (totalAmountReceived !== calculatedTotal) {
    throw new Error(`Amount Received (${totalAmountReceived}) does not match calculated value (${calculatedTotal}).`);
  }
  const timestamp = new Date().toISOString();
  let rowsSaved = 0;
  const salesRows = [];
  const paymentRows = [];
  const billNumberRows = [];
  const balanceDueRows = [];
  if (!dynamicData || dynamicData.length === 0) {
    salesRows.push({
      SaleData_ID: `S${timestamp.replace(/[-:T.]/g, '')}`,
      Date: date,
      Bill_Number: billNumber,
      Salesman: salesman,
      Shop_Name: shopName,
      Department: department,
      Mobile_Number: mobileNumber,
      Item: '',
      Amount: 0,
      RMD_CSTM: '',
      Delivery_Date: deliveryDate || null,
      Amount_Received: totalAmountReceived,
      Paymode: paymentData.map(p => p.paymode).join(', '),
      Timestamp: timestamp,
      Email_ID: userEmail
    });
    billNumberRows.push({
      Bill_Number: billNumber,
      Date: date
    });
    balanceDueRows.push({
      Due_Balance_Bill_Number: dueBalanceBillNumber || billNumber,
      Balance_Due: Number(balanceDue) || 0,
      Due_Balance_Received: Number(dueBalanceReceived) || 0,
      Date: date
    });
    rowsSaved++;
  } else {
    dynamicData.forEach((item, index) => {
      salesRows.push({
        SaleData_ID: `S${timestamp.replace(/[-:T.]/g, '')}${index}`,
        Date: date,
        Bill_Number: billNumber,
        Salesman: salesman,
        Shop_Name: shopName,
        Department: department,
        Mobile_Number: mobileNumber,
        Item: item.item,
        Amount: Number(item.amount) || 0,
        RMD_CSTM: item.rmdCstm,
        Delivery_Date: deliveryDate || null,
        Amount_Received: index === 0 ? totalAmountReceived : 0,
        Paymode: index === 0 ? paymentData.map(p => p.paymode).join(', ') : '',
        Timestamp: timestamp,
        Email_ID: userEmail
      });
      if (index === 0) {
        billNumberRows.push({
          Bill_Number: billNumber,
          Date: date
        });
        balanceDueRows.push({
          Due_Balance_Bill_Number: dueBalanceBillNumber || billNumber,
          Balance_Due: Number(balanceDue) || 0,
          Due_Balance_Received: Number(dueBalanceReceived) || 0,
          Date: date
        });
      }
      rowsSaved++;
    });
  }
  paymentData.forEach((payment, index) => {
    const amountReceived = Number(payment.amountReceived);
    if (isNaN(amountReceived) || amountReceived <= 0) {
      console.warn(`Invalid Amount_Received for payment index ${index}, Bill_Number ${billNumber}:`, payment.amountReceived);
      return;
    }
    paymentRows.push({
      PaymentData_ID: `P${timestamp.replace(/[-:T.]/g, '')}${index}`,
      Date: date,
      Bill_Number: billNumber,
      Amount_Received: amountReceived,
      Paymode: payment.paymode,
      Timestamp: timestamp
    });
  });
  if (paymentRows.length === 0) {
    throw new Error('No valid payment data provided.');
  }
  try {
    await bigquery.query({
      query: `
        DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.SalesData\`
        WHERE Bill_Number = @billNumber AND Date = @date
      `,
      params: { billNumber, date }
    });
    await bigquery.query({
      query: `
        DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.PaymentData\`
        WHERE Bill_Number = @billNumber AND Date = @date
      `,
      params: { billNumber, date }
    });
    await bigquery.query({
      query: `
        DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.BillNumbers\`
        WHERE Bill_Number = @billNumber AND Date = @date
      `,
      params: { billNumber, date }
    });
    await bigquery.query({
      query: `
        DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.Balance_Due\`
        WHERE Due_Balance_Bill_Number = @billNumber AND Date = @date
      `,
      params: { billNumber, date }
    });
    if (salesRows.length > 0) await bigquery.dataset(DATASET_ID).table('SalesData').insert(salesRows);
    if (paymentRows.length > 0) await bigquery.dataset(DATASET_ID).table('PaymentData').insert(paymentRows);
    if (billNumberRows.length > 0) await bigquery.dataset(DATASET_ID).table('BillNumbers').insert(billNumberRows);
    if (balanceDueRows.length > 0) await bigquery.dataset(DATASET_ID).table('Balance_Due').insert(balanceDueRows);
  } catch (e) {
    throw new Error('Error updating in BigQuery: ' + e.message);
  }
  return { rowsSaved };
}

async function getBillNumbersWithPendingBalance() {
  const query = `
    SELECT Due_Balance_Bill_Number AS Bill_Number, Date
    FROM \`${PROJECT_ID}.${DATASET_ID}.Balance_Due\`
    WHERE Balance_Due IS NOT NULL AND Due_Balance_Received IS NOT NULL
    GROUP BY Due_Balance_Bill_Number, Date
    HAVING SUM(CAST(Balance_Due AS FLOAT64)) > SUM(CAST(Due_Balance_Received AS FLOAT64))
  `;
  const billNumbers = await executeQuery(query);
  return billNumbers.rows ? billNumbers.rows.map(row => ({ Bill_Number: row.Bill_Number, Date: row.Date })) : [];
}

async function getNamesForSaleData() {
  const itemQuery = `SELECT DISTINCT Item FROM \`${PROJECT_ID}.${DATASET_ID}.Items\` WHERE Item IS NOT NULL`;
  const salesmanQuery = `SELECT DISTINCT Salesman FROM \`${PROJECT_ID}.${DATASET_ID}.NamesForSale\` WHERE Salesman IS NOT NULL`;
  const paymodeQuery = `SELECT DISTINCT Paymode FROM \`${PROJECT_ID}.${DATASET_ID}.Paymode\` WHERE Paymode IS NOT NULL`;
  const shopNameQuery = `SELECT DISTINCT shop_name FROM \`${PROJECT_ID}.${DATASET_ID}.SalesShopName\` WHERE shop_name IS NOT NULL`;
  const departmentQuery = `SELECT DISTINCT department FROM \`${PROJECT_ID}.${DATASET_ID}.SalesDepartment\` WHERE department IS NOT NULL`;
  const rmdCstmQuery = `SELECT DISTINCT rmd_cstm FROM \`${PROJECT_ID}.${DATASET_ID}.SalesRmdCstm\` WHERE rmd_cstm IS NOT NULL`;
  try {
    const [itemsResult, salesmenResult, paymodesResult, shopNamesResult, departmentsResult, rmdCstmsResult] = await Promise.all([
      executeQuery(itemQuery),
      executeQuery(salesmanQuery),
      executeQuery(paymodeQuery),
      executeQuery(shopNameQuery),
      executeQuery(departmentQuery),
      executeQuery(rmdCstmQuery),
    ]);
    const items = itemsResult.rows ? itemsResult.rows.map(row => row.Item).sort((a, b) => a.localeCompare(b)) : [];
    const salesmen = salesmenResult.rows ? salesmenResult.rows.map(row => row.Salesman).sort((a, b) => a.localeCompare(b)) : [];
    const paymodes = paymodesResult.rows ? paymodesResult.rows.map(row => row.Paymode).sort((a, b) => a.localeCompare(b)) : [];
    const shopNames = shopNamesResult.rows ? shopNamesResult.rows.map(row => row.shop_name).sort((a, b) => a.localeCompare(b)) : [];
    const departments = departmentsResult.rows ? departmentsResult.rows.map(row => row.department).sort((a, b) => a.localeCompare(b)) : [];
    const rmdCstms = rmdCstmsResult.rows ? rmdCstmsResult.rows.map(row => row.rmd_cstm).sort((a, b) => a.localeCompare(b)) : [];
    return { items, salesmen, paymodes, shopNames, departments, rmdCstms };
  } catch (e) {
    throw new Error(`Failed to fetch sales data: ${e.message}`);
  }
}

async function getSalesDataByBillNumberAndDate(billNumber, date) {
  let salesQuery = `
    SELECT 
      Date,
      Bill_Number,
      Salesman,
      Shop_Name,
      Department,
      Mobile_Number,
      Item,
      Amount,
      RMD_CSTM,
      Due_Balance_Received,
      Due_Balance_Bill_Number,
      Balance_Due,
      Delivery_Date,
      Amount_Received AS Total_Amount_Received
    FROM \`${PROJECT_ID}.${DATASET_ID}.SalesData\`
    WHERE Bill_Number = @billNumber AND Date = @date
    ORDER BY Timestamp DESC
  `;
  let paymentQuery = `
    SELECT 
      Paymode,
      Amount_Received
    FROM \`${PROJECT_ID}.${DATASET_ID}.PaymentData\`
    WHERE Bill_Number = @billNumber AND Date = @date
    ORDER BY Timestamp DESC
  `;
  const params = [
    { name: 'billNumber', parameterType: { type: 'STRING' }, parameterValue: { value: billNumber } },
    { name: 'date', parameterType: { type: 'DATE' }, parameterValue: { value: date } }
  ];
  try {
    const [salesResults, paymentResults] = await Promise.all([
      executeQuery(salesQuery, params),
      executeQuery(paymentQuery, params)
    ]);
    const salesRows = salesResults.rows ? salesResults.rows.map(row => ({
      Date: row.Date,
      Bill_Number: row.Bill_Number,
      Salesman: row.Salesman,
      Shop_Name: row.Shop_Name,
      Department: row.Department,
      Mobile_Number: row.Mobile_Number,
      Item: row.Item,
      Amount: row.Amount,
      RMD_CSTM: row.RMD_CSTM,
      Due_Balance_Received: row.Due_Balance_Received,
      Due_Balance_Bill_Number: row.Due_Balance_Bill_Number,
      Balance_Due: row.Balance_Due,
      Delivery_Date: row.Delivery_Date,
      Total_Amount_Received: row.Total_Amount_Received
    })) : [];
    const paymentRows = paymentResults.rows ? paymentResults.rows.map(row => ({
      Paymode: row.Paymode,
      Amount_Received: row.Amount_Received
    })) : [];
    return { salesData: salesRows, paymentData: paymentRows };
  } catch (e) {
    throw new Error(`Failed to fetch sales data: ${e.message}`);
  }
}

async function checkBillNumberDateDuplicate(billNumber, date) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${PROJECT_ID}.${DATASET_ID}.SalesData\`
    WHERE Bill_Number = @billNumber AND Date = @date
  `;
  const params = [
    { name: 'billNumber', parameterType: { type: 'STRING' }, parameterValue: { value: billNumber } },
    { name: 'date', parameterType: { type: 'DATE' }, parameterValue: { value: date } }
  ];
  const [rows] = await bigquery.query({ query, params });
  return { isDuplicate: rows && rows[0].count > 0 };
}

functions.http('sales', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  const { action, email, password, data, billNumber, date, userEmail } = req.body;

  try {
    if (action === 'authenticate') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const authResult = await authenticateUser(email, password);
      return res.status(200).json(authResult);
    }

    // Require userEmail for all other actions
    if (!userEmail) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Verify user privileges
    const privQuery = `
      SELECT p.insert
      FROM \`${PROJECT_ID}.${DATASET_ID}.users\` u
      JOIN \`${PROJECT_ID}.${DATASET_ID}.privileges\` p
      ON u.role = p.role
      WHERE u.email = @userEmail AND p.module = 'Sales'
    `;
    const privParams = [
      { name: 'userEmail', parameterType: { type: 'STRING' }, parameterValue: { value: userEmail } }
    ];
    const privResult = await executeQuery(privQuery, privParams);
    if (privResult.rows.length === 0 || !privResult.rows[0].insert) {
      return res.status(403).json({ error: 'Access denied: No insert privileges for Sales module' });
    }

    switch (action) {
      case 'getLastBillNumber':
        const lastBillNumber = await getLastBillNumber();
        return res.status(200).json({ lastBillNumber });
      case 'saveSalesData':
        const saveResult = await saveSalesData(data, userEmail);
        return res.status(200).json(saveResult);
      case 'updateSalesData':
        const updateResult = await updateSalesData(data, userEmail);
        return res.status(200).json(updateResult);
      case 'getBillNumbersWithPendingBalance':
        const billNumbers = await getBillNumbersWithPendingBalance();
        return res.status(200).json(billNumbers);
      case 'getNamesForSaleData':
        const names = await getNamesForSaleData();
        return res.status(200).json(names);
      case 'getSalesDataByBillNumberAndDate':
        const salesData = await getSalesDataByBillNumberAndDate(billNumber, date);
        return res.status(200).json(salesData);
      case 'checkBillNumberDateDuplicate':
        const duplicateResult = await checkBillNumberDateDuplicate(billNumber, date);
        return res.status(200).json(duplicateResult);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(`Error in action ${action}:`, error);
    return res.status(500).json({ error: error.message });
  }
});