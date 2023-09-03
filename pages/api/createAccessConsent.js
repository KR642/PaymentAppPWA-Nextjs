// pages/api/proxy.js

import axios from 'axios';

export default async (req, res) => {
  const accessToken = 'eyJraWQiOiJXelBqUTBBaTFZMW93V1hNdnJtaUc1UkpkNU0iLCJhbGciOiJQUzI1NiJ9.eyJjbGllbnRJZCI6ImNmZDg5M2Y1LTZmNTYtNDBhMy1hMWFjLWMxOGZjNjA4ZDNiOSIsInNjb3BlcyI6WyJhY2NvdW50cyJdLCJleHAiOjE2OTM3NTc4MjV9.YxOF0Ea_k1lMYrm9OAwmftCNVpGLxyqLgnGFGMKFamIbqFkbqZ4e6uwbaECMFIpJqqH7AsyiASO_w2g2-bANkXmNjIDIoV3AHTlwPY4ofO-O2EitnUFFGioovL7UxX3FIeGQPj5hQAOwvZB1BxQtTZiM3wE3LHLITZrDgZiAvaFbPsXCW93m5xxmrSwD98TNJo81-_VzVTGLmtob2ZxCy5cWBMBEtNDtuArEH4ehoN9_zkPzxDUL1WgjUCa3GXOqaRg-cIjmZVXJkpMvqbi4mE8zm_mVDNfZ8eHyDGCbXOb6lUhBNHiMLcI-NNizGnbCqRGMzoyw8M0_WIDOa4znwQ';  // Replace with your actual access token
  const data = JSON.stringify({
    Data: {
      Permissions: ['ReadAccountsBasic', 'ReadAccountsDetail'],
      ExpirationDateTime: '2022-12-02T00:00:00+00:00',
      TransactionFromDateTime: '2022-09-03T00:00:00+00:00',
      TransactionToDateTime: '2022-12-03T00:00:00+00:00',
    },
    Risk: {},
  });

  const config = {
    method: 'post',
    url: 'https://sandbox-oba.revolut.com/account-access-consents',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    data,
  };

  try {
    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || {});
  }
};
