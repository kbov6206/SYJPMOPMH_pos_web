     const { BigQuery } = require('@google-cloud/bigquery');

     const bigquery = new BigQuery({
       projectId: process.env.GOOGLE_CLOUD_PROJECT,
     });

     const datasetId = 'my_database';

     async function insertSalesData(data) {
       const tableId = 'SYJPMOPMHSalesData';
       const rows = data.items.flatMap(item => {
         const baseRow = {
           Date: data.date,
           Bill_Number: data.billNumber,
           Salesman: data.salesman,
           Shop_Name: data.shopName,
           Department: data.department,
           Mobile_Number: data.mobileNumber || null,
           Balance_Due: parseFloat(data.balanceDue) || null,
           Delivery_Date: data.deliveryDate || null,
           Email_ID: 'reachadeel@gmail.com',
           Timestamp: BigQuery.timestamp(new Date()),
         };
         return data.payments.map(payment => ({
           ...baseRow,
           Item: item.item || null,
           Amount: parseFloat(item.amount) || null,
           RMD_CSTM: item.rmdCstm || null,
           Paymode: payment.paymode || null,
           Amount_Received: parseFloat(payment.amountReceived) || null,
         }));
       });

       await bigquery.dataset(datasetId).table(tableId).insert(rows);

       await bigquery.dataset(datasetId).table('SYJPMOPMHBillNumbers').insert({
         Date: data.date,
         Bill_Number: data.billNumber,
         Email_ID: 'reachadeel@gmail.com',
         Timestamp: BigQuery.timestamp(new Date()),
       });

       return { insertedRows: rows.length };
     }

     async function insertDueBalanceData(data) {
       const tableId = 'SYJPMOPMHBalanceDue';
       const rows = data.dueBalanceRows.map(row => ({
         Date: data.date,
         Bill_Number: data.billNumber,
         Salesman: data.salesman,
         Shop_Name: data.shopName,
         Department: data.department,
         Mobile_Number: data.mobileNumber || null,
         Due_Balance_Received: parseFloat(row.dueBalanceReceived) || null,
         Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
         Email_ID: 'reachadeel@gmail.com',
         Timestamp: BigQuery.timestamp(new Date()),
       }));

       await bigquery.dataset(datasetId).table(tableId).insert(rows);

       await bigquery.dataset(datasetId).table('SYJPMOPMHBillNumbers').insert({
         Date: data.date,
         Bill_Number: data.billNumber,
         Email_ID: 'reachadeel@gmail.com',
         Timestamp: BigQuery.timestamp(new Date()),
       });

       return { insertedRows: rows.length };
     }

     async function getRecentSales() {
       const query = `
         SELECT DISTINCT Date, Bill_Number
         FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHSalesData\`
         WHERE Email_ID = 'reachadeel@gmail.com'
         ORDER BY Timestamp DESC
         LIMIT 10
       `;
       const [rows] = await bigquery.query(query);
       return rows;
     }

     async function getRecentDueBalances() {
       const query = `
         SELECT DISTINCT Date, Bill_Number
         FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SYJPMOPMHBalanceDue\`
         WHERE Email_ID = 'reachadeel@gmail.com'
         ORDER BY Timestamp DESC
         LIMIT 10
       `;
       const [rows] = await bigquery.query(query);
       return rows;
     }

     async function getNames() {
       const salesmenQuery = `SELECT DISTINCT Salesman FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesData\` WHERE Salesman IS NOT NULL`;
       const shopNamesQuery = `SELECT DISTINCT shop_name FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesShopName\` WHERE shop_name IS NOT NULL`;
       const departmentsQuery = `SELECT DISTINCT department FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesDepartment\` WHERE department IS NOT NULL`;
       const itemsQuery = `SELECT DISTINCT Item FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.Items\` WHERE Item IS NOT NULL`;
       const rmdCstmsQuery = `SELECT DISTINCT rmd_cstm FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.SalesRmdCstm\` WHERE rmd_cstm IS NOT NULL`;
       const paymodesQuery = `SELECT DISTINCT Paymode FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.Paymode\` WHERE Paymode IS NOT NULL`;

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
     }

     async function updateSalesData(data) {
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
           Date: data.date,
           Bill_Number: data.billNumber,
           Salesman: data.salesman,
           Shop_Name: data.shopName,
           Department: data.department,
           Mobile_Number: data.mobileNumber || null,
           Balance_Due: parseFloat(data.balanceDue) || null,
           Delivery_Date: data.deliveryDate || null,
           Email_ID: 'reachadeel@gmail.com',
           Timestamp: BigQuery.timestamp(new Date()),
         };
         return data.payments.map(payment => ({
           ...baseRow,
           Item: item.item || null,
           Amount: parseFloat(item.amount) || null,
           RMD_CSTM: item.rmdCstm || null,
           Paymode: payment.paymode || null,
           Amount_Received: parseFloat(payment.amountReceived) || null,
         }));
       });

       await bigquery.dataset(datasetId).table(tableId).insert(rows);
       return { updatedRows: rows.length };
     }

     async function updateDueBalanceData(data) {
       const tableId = 'SYJPMOPMHBalanceDue';
       const deleteQuery = `
         DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${datasetId}.${tableId}\`
         WHERE Bill_Number = @billNumber AND Date = @date AND Email_ID = 'reachadeel@gmail.com'
       `;
       await bigquery.query({
         query: deleteQuery,
         params: { billNumber: data.billNumber, date: data.date },
       });

       const rows = data.dueBalanceRows.map(row => ({
         Date: data.date,
         Bill_Number: data.billNumber,
         Salesman: data.salesman,
         Shop_Name: data.shopName,
         Department: data.department,
         Mobile_Number: data.mobileNumber || null,
         Due_Balance_Received: parseFloat(row.dueBalanceReceived) || null,
         Due_Balance_Bill_Number: row.dueBalanceBillNumber || null,
         Email_ID: 'reachadeel@gmail.com',
         Timestamp: BigQuery.timestamp(new Date()),
       }));

       await bigquery.dataset(datasetId).table(tableId).insert(rows);
       return { updatedRows: rows.length };
     }

     async function getSalesData(billNumber, date) {
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
     }

     async function getDueBalanceData(billNumber, date) {
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
     }

     async function checkDuplicateBillNumber(billNumber, date) {
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