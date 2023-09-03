import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { amount, currency, accountId, accessToken } = req.body;

    const response = await axios.post(
      'https://api.revolut.com/api/1.0/pay',
      {
        request_id: `req_${Date.now()}`, // Create a unique request ID
        amount,
        currency,
        account_id: accountId, // Your Revolut account ID
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 201) {
      return res.status(201).json({ message: 'Payment created successfully' });
    } else {
      return res.status(400).json({ error: 'Failed to create payment' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `Failed to create payment: ${error.message}` });
  }
}
