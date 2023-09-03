import { useState, useEffect } from 'react';
import axios from 'axios';

const CreatePayment = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [accessToken, setAccessToken] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post('/api/getAccessToken'); // adjust the URL if needed
        setAccessToken(response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  const generateUniqueRequestId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `req_${timestamp}_${randomNum}`;
  };

  const uniqueRequestId = generateUniqueRequestId();

  const createPayment = async () => {
    // Reset messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validation
    if (!amount || isNaN(Number(amount))) {
      setErrorMessage('Invalid amount');
      return;
    }

    // API request payload
    const data = {
      request_id: uniqueRequestId, // Replace with a unique request ID
      currency,
      amount,
      account_id: 'akshaymanoj', // Replace with your Revolut account_id
    };

    try {
      // Make API request
      const response = await axios.post('/api/createPayment', {
        amount,
        currency,
        accountId: 'akshaymanoj', // Your Revolut account ID
        accessToken,
      });

      if (response.status === 201) {
        setSuccessMessage('Payment created successfully');
      }
    } catch (error) {
      setErrorMessage(`Failed to create payment: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Create Payment</h1>
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
        <option value="GBP">GBP</option>
      </select>
      <button onClick={createPayment}>Create Payment</button>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default CreatePayment;
