"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const fetchPrintData = async (billNumber, date, userEmail, showNotification) => {
  const payload = {
    action: 'getSalesDataByBillNumberAndDate',
    billNumber,
    date,
    userEmail
  };
  console.log('fetchPrintData payload:', payload);
  try {
    const response = await fetch(window.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log('fetchPrintData response:', result);
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error) {
    showNotification('Error fetching print data: ' + error.message, 'error');
    return null;
  }
};
function SalesRecentTable(_ref) {
  let {
    userEmail,
    showNotification
  } = _ref;
  const [sales, setSales] = (0, _react.useState)([]);
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const fetchSalesData = async () => {
    setIsLoading(true);
    const payload = {
      action: 'getRecentEntries',
      table: 'SalesData',
      userEmail,
      limit: 20
    };
    console.log('fetchSalesData payload:', payload);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('fetchSalesData response:', result);
      if (result.error) throw new Error(result.error);
      setSales(result.recentEntries || []);
    } catch (error) {
      showNotification('Error fetching sales data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  (0, _react.useEffect)(() => {
    fetchSalesData();
  }, [userEmail]);
  const initializeForm = (billNumber, date) => {
    if (window.salesFormInitialize) {
      window.salesFormInitialize(billNumber, date);
    }
  };
  return /*#__PURE__*/_react.default.createElement('div', {
    className: 'table-container'
  }, isLoading && /*#__PURE__*/_react.default.createElement('div', {
    className: 'loading-overlay'
  }, 'Loading sales data...'), /*#__PURE__*/_react.default.createElement('table', {
    className: 'sales-table'
  }, /*#__PURE__*/_react.default.createElement('thead', null, /*#__PURE__*/_react.default.createElement('tr', null, /*#__PURE__*/_react.default.createElement('th', null, 'Date'), /*#__PURE__*/_react.default.createElement('th', null, 'Bill Number'), /*#__PURE__*/_react.default.createElement('th', null, 'Shop'), /*#__PURE__*/_react.default.createElement('th', null, 'Salesman'), /*#__PURE__*/_react.default.createElement('th', null, 'Amount'), /*#__PURE__*/_react.default.createElement('th', null, 'Actions'))), /*#__PURE__*/_react.default.createElement('tbody', null, sales.map((sale, index) => /*#__PURE__*/_react.default.createElement('tr', {
    key: index
  }, /*#__PURE__*/_react.default.createElement('td', null, sale.Date ? sale.Date : 'Unknown'), /*#__PURE__*/_react.default.createElement('td', null, sale.Bill_Number), /*#__PURE__*/_react.default.createElement('td', null, sale.Shop_Name || 'Unknown'), /*#__PURE__*/_react.default.createElement('td', null, sale.Salesman || 'Unknown'), /*#__PURE__*/_react.default.createElement('td', null, sale.Total_Amount || 0), /*#__PURE__*/_react.default.createElement('td', null, /*#__PURE__*/_react.default.createElement('button', {
    onClick: () => initializeForm(sale.Bill_Number, sale.Date),
    className: 'bg-blue-500 text-white p-1 rounded mr-2'
  }, 'Edit')))))));
}
function SalesPrintPreview(_ref2) {
  let {
    sales,
    showNotification
  } = _ref2;
  const [printData, setPrintData] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    const fetchData = async () => {
      const data = await fetchPrintData(sales.billNumber, sales.date, sales.userEmail, showNotification);
      setPrintData(data);
    };
    if (sales.billNumber && sales.date) {
      fetchData();
    }
  }, [sales.billNumber, sales.date, sales.userEmail]);
  return /*#__PURE__*/_react.default.createElement('div', {
    id: 'salesPrintPreview',
    className: 'print-preview'
  }, printData ? /*#__PURE__*/_react.default.createElement('div', null, /*#__PURE__*/_react.default.createElement('h3', null, 'Sales Receipt'), /*#__PURE__*/_react.default.createElement('p', null, `Bill Number: ${printData.billNumber}`), /*#__PURE__*/_react.default.createElement('p', null, `Date: ${printData.date}`), /*#__PURE__*/_react.default.createElement('p', null, `Shop: ${printData.salesData[0]?.Shop_Name || 'Unknown'}`), /*#__PURE__*/_react.default.createElement('p', null, `Salesman: ${printData.salesData[0]?.Salesman || 'Unknown'}`)) : /*#__PURE__*/_react.default.createElement('div', null, 'No data available'));
}
window.SalesRecentTable = SalesRecentTable;
window.SalesPrintPreview = SalesPrintPreview;
var _default = exports.default = SalesRecentTable;
