module.exports = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'myposdata',
  datasetId: 'my_database',
  salesTableId: 'SYJPMOPMHSalesData',
  dueBalanceTableId: 'SYJPMOPMHBalanceDue',
  billNumbersTableId: 'SYJPMOPMHBillNumbers',
  paymentTableId: 'SYJPMOPMHPaymentData',
  namesForSaleTableId: 'NamesForSale',
  shopNameTableId: 'SalesShopName',
  itemsTableId: 'Items',
  paymodeTableId: 'Paymode',
  rmdCstmTableId: 'SalesRmdCstm',
};