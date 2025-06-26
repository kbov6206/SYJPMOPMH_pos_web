const { useState, useEffect, useRef } = React;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'authenticate', email, password })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      if (result.isAuthenticated) {
        setUserEmail(email);
        setIsAuthenticated(true);
        sessionStorage.setItem('userEmail', email);
        showNotification('Login successful!', 'success');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    sessionStorage.removeItem('userEmail');
    showNotification('Logged out successfully!', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  if (!window.SalesRecentTable || !window.SalesPrintPreview) {
    return React.createElement('div', null, 'Error: Required components not loaded.');
  }

  return React.createElement(
    'div',
    null,
    notification.message && React.createElement(
      'div',
      { className: `notification ${notification.type}` },
      notification.message
    ),
    isLoading && React.createElement(
      'div',
      { className: 'loading-overlay' },
      'Authenticating...'
    ),
    isAuthenticated ? React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'flex justify-between p-4 bg-gray-100' },
        React.createElement('h1', { className: 'text-xl font-bold' }, 'SYJPMOPMH POS'),
        React.createElement(
          'div',
          null,
          React.createElement('span', { className: 'mr-4' }, userEmail),
          React.createElement(
            'button',
            {
              onClick: logout,
              className: 'bg-red-500 text-white p-2 rounded'
            },
            'Logout'
          )
        )
      ),
      React.createElement(SalesForm, { userEmail, showNotification })
    ) : React.createElement(LoginForm, { login })
  );
}

function LoginForm({ login }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return React.createElement(
    'div',
    { className: 'login-container' },
    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Login'),
    React.createElement(
      'div',
      { className: 'form' },
      React.createElement(
        'div',
        { className: 'mb-4' },
        React.createElement('label', { htmlFor: 'email', className: 'block mb-1' }, 'Email'),
        React.createElement('input', {
          type: 'email',
          id: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: 'border p-2 w-full',
          required: true,
          autoComplete: 'username'
        })
      ),
      React.createElement(
        'div',
        { className: 'mb-4' },
        React.createElement('label', { htmlFor: 'password', className: 'block mb-1' }, 'Password'),
        React.createElement('input', {
          type: 'password',
          id: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          className: 'border p-2 w-full',
          required: true,
          autoComplete: 'current-password'
        })
      ),
      React.createElement(
        'button',
        { onClick: handleSubmit, className: 'bg-blue-500 text-white p-2 rounded w-full' },
        'Login'
      )
    )
  );
}

function SalesForm({ userEmail, showNotification }) {
  const [salesRows, setSalesRows] = useState([{ item: '', amount: '', rmdCstm: '' }]);
  const [salesPaymentRows, setSalesPaymentRows] = useState([{ paymode: '', amountReceived: '' }]);
  const [salesItems, setSalesItems] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [paymodes, setPaymodes] = useState([]);
  const [shopNames, setShopNames] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rmdCstms, setRmdCstms] = useState([]);
  const [lastSalesDate, setLastSalesDate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBillNumber, setCurrentBillNumber] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billNumber: '',
    salesman: '',
    shopName: '',
    department: '',
    mobileNumber: '',
    dueBalanceReceived: '',
    dueBalanceBillNumber: '',
    balanceDue: '',
    deliveryDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [billNumbers, setBillNumbers] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const datePickerRef = useRef(null);
  const deliveryDatePickerRef = useRef(null);

  window.salesFormInitialize = (billNumber, date) => {
    setIsEditMode(true);
    setCurrentBillNumber(billNumber);
    setCurrentDate(date);
    setFormData(prev => ({ ...prev, billNumber, date }));
    fetchSalesData(billNumber, date);
  };

  const fetchSalesData = async (billNumber, date) => {
    setIsLoading(true);
    const payload = { action: 'getSalesDataByBillNumberAndDate', billNumber, date, userEmail };
    console.log('fetchSalesData payload:', payload);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('fetchSalesData response:', result);
      if (result.error) throw new Error(result.error);
      const { salesData, paymentData } = result;
      if (salesData && salesData.length > 0) {
        setFormData(prev => ({
          ...prev,
          salesman: salesData[0].Salesman || '',
          shopName: salesData[0].Shop_Name || '',
          department: salesData[0].Department || '',
          mobileNumber: salesData[0].Mobile_Number || '',
          dueBalanceReceived: salesData[0].Due_Balance_Received || '',
          dueBalanceBillNumber: salesData[0].Due_Balance_Bill_Number || '',
          balanceDue: salesData[0].Balance_Due || '',
          deliveryDate: salesData[0].Delivery_Date || ''
        }));
        setSalesRows(salesData.map(row => ({
          item: row.Item || '',
          amount: row.Amount || '',
          rmdCstm: row.RMD_CSTM || ''
        })));
        setSalesPaymentRows(paymentData.map(row => ({
          paymode: row.Paymode || '',
          amountReceived: row.Amount_Received || ''
        })));
      }
    } catch (error) {
      showNotification(`Error fetching sales data: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (datePickerRef.current) {
      flatpickr(datePickerRef.current, {
        dateFormat: 'Y-m-d',
        defaultDate: lastSalesDate || new Date(),
        onChange: (selectedDates, dateStr) => {
          setFormData(prev => ({ ...prev, date: dateStr }));
          setLastSalesDate(dateStr);
        }
      });
    }
    if (deliveryDatePickerRef.current) {
      flatpickr(deliveryDatePickerRef.current, {
        dateFormat: 'Y-m-d',
        onChange: (selectedDates, dateStr) => {
          setFormData(prev => ({ ...prev, deliveryDate: dateStr }));
        }
      });
    }
  }, [lastSalesDate]);

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    setIsLoading(true);
    const payload = { action: 'getNamesForSaleData', userEmail };
    console.log('fetchNames payload:', payload);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('fetchNames response:', result);
      if (result.error) throw new Error(result.error);
      setSalesItems(result.items || []);
      setSalesmen(result.salesmen || []);
      setPaymodes(result.paymodes || []);
      setShopNames(result.shopNames || []);
      setDepartments(result.departments || []);
      setRmdCstms(result.rmdCstms || []);
      updateDueBalanceBillNumbers();
    } catch (error) {
      showNotification('Failed to load sales data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDueBalanceBillNumbers = async () => {
    setIsLoading(true);
    const payload = { action: 'getBillNumbersWithPendingBalance', userEmail };
    console.log('updateDueBalanceBillNumbers payload:', payload);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('updateDueBalanceBillNumbers response:', result);
      if (result.error) throw new Error(result.error);
      setBillNumbers(result || []);
    } catch (error) {
      showNotification('Failed to load bill numbers: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addRow = () => {
    setSalesRows(prev => [...prev, { item: '', amount: '', rmdCstm: '' }]);
  };

  const addPaymentRow = () => {
    setSalesPaymentRows(prev => [...prev, { paymode: '', amountReceived: '' }]);
  };

  const removeRow = (index) => {
    setSalesRows(prev => prev.filter((_, i) => i !== index));
  };

  const removePaymentRow = (index) => {
    setSalesPaymentRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setSalesRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const updatePaymentRow = (index, field, value) => {
    console.log(`updatePaymentRow: index=${index}, field=${field}, value=${value}`);
    setSalesPaymentRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const updateTotal = () => {
    console.log('updateTotal called');
    let totalItems = 0;
    salesRows.forEach(row => {
      if (row.amount) {
        const amount = parseFloat(row.amount);
        if (!isNaN(amount)) totalItems += amount;
      }
    });
    const dueBalanceReceived = parseFloat(formData.dueBalanceReceived) || 0;
    const balanceDue = parseFloat(formData.balanceDue) || 0;
    let totalReceived = 0;
    salesPaymentRows.forEach(row => {
      if (row.amountReceived) {
        const amount = parseFloat(row.amountReceived);
        if (!isNaN(amount)) totalReceived += amount;
      }
    });
    const total = parseFloat((totalItems + dueBalanceReceived - balanceDue).toFixed(2));
    totalReceived = parseFloat(totalReceived.toFixed(2));
    console.log(`Calculated: totalItems=${totalItems}, dueBalanceReceived=${dueBalanceReceived}, balanceDue=${balanceDue}, total=${total}, totalReceived=${totalReceived}`);
    setTotalAmount(total);
    setAmountReceived(totalReceived);
  };

  useEffect(() => {
    updateTotal();
  }, [salesRows, salesPaymentRows, formData.dueBalanceReceived, formData.balanceDue]);

  const isItemRowFilled = (row) => {
    return row.item && salesItems.includes(row.item) &&
           row.amount && row.rmdCstm && rmdCstms.includes(row.rmdCstm);
  };

  const isDueBalanceGroupFilled = () => {
    return formData.dueBalanceReceived && formData.dueBalanceBillNumber;
  };

  const isBalanceDueGroupFilled = () => {
    return formData.balanceDue && formData.deliveryDate;
  };

  const isPaymentRowFilled = (row) => {
    const amount = parseFloat(row.amountReceived);
    return row.paymode && 
           paymodes.includes(row.paymode) && 
           !isNaN(amount) && 
           amount > 0;
  };

  const isCombinationAFilled = () => {
    return salesRows.some(isItemRowFilled) &&
           isDueBalanceGroupFilled() &&
           isBalanceDueGroupFilled() &&
           salesPaymentRows.some(isPaymentRowFilled);
  };

  const isCombinationBFilled = () => {
    return salesRows.some(isItemRowFilled) &&
           isBalanceDueGroupFilled() &&
           salesPaymentRows.some(isPaymentRowFilled);
  };

  const isCombinationCFilled = () => {
    return isDueBalanceGroupFilled() &&
           salesPaymentRows.some(isPaymentRowFilled);
  };

  const isCombinationDFilled = () => {
    return salesRows.some(isItemRowFilled) &&
           isDueBalanceGroupFilled() &&
           salesPaymentRows.some(isPaymentRowFilled);
  };

  const isCombinationEFilled = () => {
    return salesRows.some(isItemRowFilled) &&
           salesPaymentRows.some(isPaymentRowFilled);
  };

  const checkBillNumberDateDuplicate = async (billNumber, date) => {
    const payload = { action: 'checkBillNumberDateDuplicate', billNumber, date, userEmail };
    console.log('checkBillNumberDateDuplicate payload:', payload);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log('checkBillNumberDateDuplicate response:', result);
      if (result.error) throw new Error(result.error);
      return result.isDuplicate;
    } catch (error) {
      showNotification('Error validating bill number and date: ' + error.message, 'error');
      return true;
    }
  };

  const submit = async () => {
    if (!formData.date || !formData.billNumber || !formData.salesman || !formData.shopName || !formData.department) {
      showNotification('Please fill out all required static fields.', 'error');
      return;
    }

    if (!isEditMode) {
      const isDuplicate = await checkBillNumberDateDuplicate(formData.billNumber, formData.date);
      if (isDuplicate) {
        showNotification('This bill number and date combination already exists.', 'error');
        return;
      }
    }

    if (!isEditMode) {
      const invalidRows = salesRows.reduce((acc, row, i) => {
        if (!isItemRowFilled(row)) acc.push(i + 1);
        return acc;
      }, []);
      if (invalidRows.length > 0) {
        showNotification(`Invalid rows: ${invalidRows.join(', ')}`, 'error');
        return;
      }
    }

    if (salesPaymentRows.length > 0) {
      const invalidPaymentRows = salesPaymentRows.reduce((acc, row, i) => {
        if (!isPaymentRowFilled(row)) {
          acc.push(i + 1);
        }
        return acc;
      }, []);
      if (invalidPaymentRows.length > 0) {
        showNotification(`Invalid payment rows: ${invalidPaymentRows.join(', ')}`, 'error');
        return;
      }
    }

    if (Math.abs(totalAmount - amountReceived) > 0.01) {
      showNotification('Total Amount and Amount Received must be equal.', 'error');
      return;
    }

    const data = {
      ...formData,
      data: salesRows.filter(isItemRowFilled),
      paymentData: salesPaymentRows.filter(isPaymentRowFilled)
    };
    console.log('submit payload:', data);

    setIsLoading(true);
    try {
      const response = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isEditMode ? 'updateSalesData' : 'saveSalesData', data, userEmail })
      });
      const result = await response.json();
      console.log('submit response:', result);
      if (result.error) throw new Error(result.error);
      showNotification(`Sales data ${isEditMode ? 'updated' : 'saved'} successfully! Rows saved: ${result.rowsSaved}`, 'success');
      resetForm();
    } catch (error) {
      showNotification(`Error ${isEditMode ? 'updating' : 'saving'} sales data: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setCurrentBillNumber(null);
    setCurrentDate(null);
    setFormData({
      date: lastSalesDate || new Date().toISOString().split('T')[0],
      billNumber: '',
      salesman: '',
      shopName: '',
      department: '',
      mobileNumber: '',
      dueBalanceReceived: '',
      dueBalanceBillNumber: '',
      balanceDue: '',
      deliveryDate: ''
    });
    setSalesRows([{ item: '', amount: '', rmdCstm: '' }]);
    setSalesPaymentRows([{ paymode: '', amountReceived: '' }]);
    updateTotal();
  };

  return React.createElement(
    'div',
    { id: 'sales', className: 'module max-w-4xl mx-auto p-4' },
    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Sales Data Entry'),
    isLoading && React.createElement(
      'div',
      { className: 'loading-overlay' },
      isEditMode ? 'Updating sales data...' : 'Saving sales data...'
    ),
    React.createElement(
      'div',
      { id: 'salesForm' },
      React.createElement(
        'div',
        { className: 'static-row' },
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesDate', className: 'block mb-1' }, 'Date'),
          React.createElement('input', {
            type: 'text',
            id: 'salesDate',
            ref: datePickerRef,
            value: formData.date,
            onChange: e => setFormData(prev => ({ ...prev, date: e.target.value })),
            required: true,
            className: 'border p-2 rounded w-full focus:ring-2 focus:ring-blue-500'
          })
        ),
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesBillNumber', className: 'block mb-1' }, 'Bill Number'),
          React.createElement('input', {
            type: 'text',
            id: 'salesBillNumber',
            value: formData.billNumber,
            onChange: async e => {
              setFormData(prev => ({ ...prev, billNumber: e.target.value }));
              if (!isEditMode && e.target.value && formData.date) {
                const isDuplicate = await checkBillNumberDateDuplicate(e.target.value, formData.date);
                if (isDuplicate) {
                  showNotification('This bill number and date combination already exists.', 'error');
                }
              }
            },
            required: true,
            className: 'border p-2 rounded w-full focus:ring-2 focus:ring-blue-500'
          })
        )
      ),
      React.createElement(
        'div',
        { className: 'static-row' },
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesSalesman', className: 'block mb-1' }, 'Salesman'),
          React.createElement(
            'select',
            {
              id: 'salesSalesman',
              value: formData.salesman,
              onChange: e => setFormData(prev => ({ ...prev, salesman: e.target.value })),
              required: true,
              className: 'border p-2 rounded w-full focus:ring-2 focus:ring-blue-500'
            },
            React.createElement('option', { value: '' }, 'Select'),
            salesmen.map(salesman => React.createElement('option', { key: salesman, value: salesman }, salesman))
          )
        ),
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesShopName', className: 'block mb-1' }, 'Shop Name'),
          React.createElement(
            'select',
            {
              id: 'salesShopName',
              value: formData.shopName,
              onChange: e => setFormData(prev => ({ ...prev, shopName: e.target.value })),
              required: true,
              className: 'border p-2 rounded w-full focus:ring-2 focus:ring-blue-500'
            },
            React.createElement('option', { value: '' }, 'Select'),
            shopNames.map(name => React.createElement('option', { key: name, value: name }, name))
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'static-row' },
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesDepartment', className: 'block mb-1' }, 'Department'),
          React.createElement(
            'select',
            {
              id: 'salesDepartment',
              value: formData.department,
              onChange: e => setFormData(prev => ({ ...prev, department: e.target.value })),
              required: true,
              className: 'border p-2 rounded w-full focus:ring-2 focus:ring-blue-500'
            },
            React.createElement('option', { value: '' }, 'Select'),
            departments.map(dept => React.createElement('option', { key: dept, value: dept }, dept))
          )
        ),
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesPhoneNumber', className: 'block mb-1' }, 'Phone Number'),
          React.createElement('input', {
            type: 'tel',
            id: 'salesPhoneNumber',
            value: formData.mobileNumber,
            onChange: e => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData(prev => ({ ...prev, mobileNumber: value }));
              if (value.length > 0 && value.length !== 11) {
                showNotification('Phone number must be 11 digits long.', 'error');
              }
            },
            className: 'border p-2 rounded w-full'
          })
        )
      ),
      React.createElement(
        'div',
        { id: 'salesRows' },
        React.createElement(
          'div',
          { className: 'dynamic-row font-bold' },
          React.createElement('span', { style: { minWidth: '50px' } }),
          React.createElement('span', { style: { flex: 1, minWidth: '120px' } }, 'Item'),
          React.createElement('span', { style: { flex: 1, minWidth: '120px' } }, 'Amount'),
          React.createElement('span', { style: { flex: 1, minWidth: '120px' } }, 'RMD/CST'),
          React.createElement('span', null)
        ),
        salesRows.map((row, index) => React.createElement(
          'div',
          { key: index, className: 'dynamic-row' },
          React.createElement('span', { style: { minWidth: '50px' } }, `Row ${index + 1}`),
          React.createElement(
            'select',
            {
              className: 'sales-item-select border p-2 rounded focus:ring-blue-500',
              value: row.item,
              onChange: e => updateRow(index, 'item', e.target.value),
              required: true
            },
            React.createElement('option', { value: '' }, 'Select'),
            salesItems.map(item => React.createElement('option', { key: item, value: item }, item))
          ),
          React.createElement('input', {
            type: 'number',
            step: 'any',
            value: row.amount,
            onChange: e => updateRow(index, 'amount', e.target.value),
            onKeyDown: e => {
              const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', '-', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
              if (!allowedKeys.includes(e.key)) e.preventDefault();
            },
            onFocus: e => e.target.select(),
            placeholder: 'Amount',
            className: 'border p-2 rounded focus:ring-blue-500',
            required: true
          }),
          React.createElement(
            'select',
            {
              className: 'sales-bg-select border p-2 rounded focus:ring-blue-500',
              value: row.rmdCstm,
              onChange: e => updateRow(index, 'rmdCstm', e.target.value),
              required: true
            },
            React.createElement('option', { value: '' }, 'Select'),
            rmdCstms.map(rmd => React.createElement('option', { key: rmd, value: rmd }, rmd))
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'sales-remove-row bg-red-500 text-white p-2 rounded hover:bg-red-600',
              onClick: () => removeRow(index)
            },
            'Remove'
          )
        ))
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          id: 'salesAddItemRow',
          className: 'bg-blue-600 text-white p-2 rounded my-4 hover:bg-blue-700',
          onClick: addRow
        },
        'Add Item Row'
      ),
      React.createElement(
        'div',
        { id: 'payment-row' },
        React.createElement(
          'div',
          { className: 'dynamic-row font-bold' },
          React.createElement('span', { style: { minWidth: '50px' } }),
          React.createElement('span', { style: { flex: 1, minWidth: '120px' } }, 'Paymode'),
          React.createElement('span', { style: { flex: 1, minWidth: '120px' } }, 'Amount Received'),
          React.createElement('span', null)
        ),
        salesPaymentRows.map((row, index) => React.createElement(
          'div',
          { key: index, className: 'dynamic-row' },
          React.createElement('span', { style: { minWidth: '50px' } }, `Payment ${index + 1}`),
          React.createElement(
            'select',
            {
              value: row.paymode,
              onChange: e => updatePaymentRow(index, 'paymode', e.target.value),
              required: true,
              className: 'border p-2 rounded focus:ring-blue-500'
            },
            React.createElement('option', { value: '' }, 'Select'),
            paymodes.map(paymode => React.createElement('option', { key: paymode, value: paymode }, paymode))
          ),
          React.createElement('input', {
            type: 'number',
            step: 'any',
            value: row.amountReceived,
            onChange: e => {
              const value = e.target.value;
              console.log(`Amount Received input: ${value}`);
              updatePaymentRow(index, 'amountReceived', value);
            },
            onKeyDown: e => {
              const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', '-', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
              if (!allowedKeys.includes(e.key)) e.preventDefault();
            },
            onFocus: e => e.target.select(),
            placeholder: 'Amount Received',
            className: 'border p-2 rounded focus:ring-blue-500',
            required: true
          }),
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'sales-remove-payment-row bg-red-500 text-white p-2 rounded hover:bg-red-600',
              onClick: () => removePaymentRow(index)
            },
            'Remove'
          )
        ))
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          id: 'salesAddPaymentRow',
          className: 'bg-blue-600 text-white p-2 rounded my-4 hover:bg-blue-700',
          onClick: addPaymentRow
        },
        'Add Payment Row'
      ),
      React.createElement(
        'div',
        { className: 'static-row' },
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesDueBalanceReceived', className: 'block mb-1' }, 'Due Balance Received'),
          React.createElement('input', {
            type: 'number',
            step: 'any',
            id: 'salesDueBalanceReceived',
            value: formData.dueBalanceReceived,
            onChange: e => {
              setFormData(prev => ({ ...prev, dueBalanceReceived: e.target.value }));
            },
            onKeyDown: e => {
              const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
              if (!allowedKeys.includes(e.key)) e.preventDefault();
            },
            onFocus: e => e.target.select(),
            className: 'border p-2 rounded w-full focus:ring-blue-500'
          })
        ),
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesDueBalanceBillNumber', className: 'block mb-1' }, 'Due Balance Bill Number'),
          React.createElement(
            'select',
            {
              id: 'salesDueBalanceBillNumber',
              value: formData.dueBalanceBillNumber,
              onChange: e => {
                setFormData(prev => ({ ...prev, dueBalanceBillNumber: e.target.value }));
              },
              className: 'border p-2 rounded w-full focus:ring-blue-500'
            },
            React.createElement('option', { value: '' }, 'Select'),
            billNumbers.map(bill => React.createElement(
              'option',
              { key: bill.Bill_Number, value: bill.Bill_Number },
              `${bill.Bill_Number} (${bill.Date && bill.Date.value ? new Date(bill.Date.value).toISOString().split('T')[0] : 'Unknown'})`
            ))
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'static-row' },
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesBalanceDue', className: 'block mb-1' }, 'Balance Due'),
          React.createElement('input', {
            type: 'number',
            step: 'any',
            id: 'salesBalanceDue',
            value: formData.balanceDue,
            onChange: e => {
              setFormData(prev => ({ ...prev, balanceDue: e.target.value }));
            },
            onKeyDown: e => {
              const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
              if (!allowedKeys.includes(e.key)) e.preventDefault();
            },
            onFocus: e => e.target.select(),
            className: 'border p-2 rounded w-full focus:ring-blue-500'
          })
        ),
        React.createElement(
          'div',
          null,
          React.createElement('label', { htmlFor: 'salesDeliveryDate', className: 'block mb-1' }, 'Delivery Date'),
          React.createElement('input', {
            type: 'text',
            id: 'salesDeliveryDate',
            ref: deliveryDatePickerRef,
            value: formData.deliveryDate,
            onChange: e => setFormData(prev => ({ ...prev, deliveryDate: e.target.value })),
            className: 'border p-2 rounded w-full focus:ring-blue-500'
          })
        )
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          id: 'salesSubmit',
          className: 'bg-green-500 text-white p-2 rounded w-full my-4 hover:bg-green-600',
          onClick: submit
        },
        isEditMode ? 'Update' : 'Submit'
      ),
      React.createElement(
        'div',
        { className: 'totals' },
        React.createElement('div', { id: 'salesTotalAmount', className: 'font-bold' }, `Total Amount: ${totalAmount.toFixed(2)}`),
        React.createElement('div', { id: 'salesAmountReceived', className: 'font-bold' }, `Amount Received: ${amountReceived.toFixed(2)}`)
      ),
      React.createElement(
        'div',
        { className: 'table-container' },
        React.createElement(window.SalesRecentTable, { userEmail, showNotification })
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          id: 'salesPrintBtn',
          className: 'bg-gray-500 text-white p-2 rounded my-4 hover:bg-gray-600',
          onClick: () => document.getElementById('salesPrintSidebar').classList.toggle('open')
        },
        'Print Preview'
      ),
      React.createElement(
        'div',
        { id: 'salesPrintSidebar', className: 'print-sidebar' },
        React.createElement(window.SalesPrintPreview, { sales: { billNumber: formData.billNumber, date: formData.date, userEmail }, showNotification }),
        React.createElement(
          'button',
          {
            id: 'salesPrint',
            className: 'bg-blue-500 text-white p-2 rounded',
            onClick: () => {
              const printContent = document.getElementById('salesPrintPreview').innerHTML;
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`<html><head><title>Print</title></head><body>${printContent}</body></html>`);
              printWindow.document.close();
              printWindow.print();
            }
          },
          'Print'
        )
      )
    )
  );
}

window.App = App;
