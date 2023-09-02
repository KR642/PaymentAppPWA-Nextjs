// pages/api/getQuantumNumber.js

import fetch from 'node-fetch';

export default async (req, res) => {
  const API_ENDPOINT = "https://api.quantumnumbers.anu.edu.au";
  const API_KEY = "dSnW5KHJS21FN7fk8nmVi9XP2jcU2q4H1KOZMnE5";
  
  try {
    const response = await fetch(`${API_ENDPOINT}?length=1&type=uint16`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch quantum number');
    }

    const data = await response.json();
    const randomNumber = data.data[0]; // Based on the response structure, assuming the random number will be in a data array
    res.status(200).json({ randomNumber });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
