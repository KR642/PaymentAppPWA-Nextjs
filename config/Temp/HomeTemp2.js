import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  collection, query, where, getDocs, updateDoc, addDoc
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import Layout from './components/Layout';
import {
  Button, TextField, Container, Typography, Paper, CssBaseline, Snackbar
} from '@mui/material';
import { config } from 'dotenv';
config();

const Home = () => {
  const { user } = useUserAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sortCode: '',
    accountNo: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(''); // 'success' or 'error'
  const constantKey = "Fuzzy9Platypus$RainDance!";

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user) return;  // Return if user is not present
      setLoading(true);
      try {
        const bankDetailsRef = collection(db, 'BankDetails');
        const bankDetailsQuery = query(bankDetailsRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(bankDetailsQuery);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const { firstName, lastName, sortCode, accountNo, q2 } = docData;
          if (!q2) {
            console.error("Quantum key is missing");
            return;
          }
          if (!firstName || !lastName || !sortCode || !accountNo || !q2) {
            console.error("Incomplete data");
            return;
          }
          //debugging
          // console.log("First Name: "+firstName);
          // console.log("Last Name: "+lastName);
          // console.log("sort Code: "+sortCode);
          // console.log("Account No: "+accountNo);
          // console.log("q2: "+q2);

          // console.log("d First Name: "+decrypt(firstName, q2));
          // console.log("d Last Name: "+lastName);
          // console.log("d sort Code: "+sortCode);
          // console.log("d Account No: "+accountNo);
          // console.log("d q2: "+q2);

          const decryptedFirstName = decrypt(firstName, decryptQuantumKey(q2));
          const decryptedLastName = decrypt(lastName, decryptQuantumKey(q2));
          const decryptedSortCode = decrypt(sortCode, decryptQuantumKey(q2));
          const decryptedAccountNo = decrypt(accountNo, decryptQuantumKey(q2));

          if (!decryptedFirstName || !decryptedLastName || !decryptedSortCode || !decryptedAccountNo) {
            console.error("Decryption failed");
            return;
          }

          const newDetails = {
            firstName: decryptedFirstName,
            lastName: decryptedLastName,
            sortCode: decryptedSortCode,
            accountNo: decryptedAccountNo,
            quantumKey: decryptQuantumKey(q2)
          };

          setUserDetails(newDetails);
          setFormData(newDetails);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [user]);

const fetchQuantumRandomNumber = async () => {
  // const response = await fetch('/api/getQuantumNumber');
  //   const data = await response.json();
  const randomNum = 34454;
  return randomNum;
  // return data.randomNumber;
};

const crypto = require('crypto');

const encryptQuantumKey = (quantumKey) => {
  if (!quantumKey) {  // Add a null check here.
    return null;
  }
  const cipher = crypto.createCipher('aes-256-cbc', constantKey);
  let encrypted = cipher.update(String(quantumKey), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptQuantumKey = (encryptedQuantumKey) => {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', constantKey);
    let decrypted = decipher.update(encryptedQuantumKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Error decrypting quantum key:", err);
    return null;
  }
};



const getKeyFromNumber = (num) => {
  return crypto.createHash('sha256').update(String(num)).digest();
};

const encrypt = (text, keyNumber) => {
  const key = getKeyFromNumber(keyNumber);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text, keyNumber) => {
  try {
    const key = getKeyFromNumber(keyNumber);
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "sortCode") {
      const formattedValue = formatSortCode(value);
      if (formattedValue.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!isValidSortCode(formData.sortCode)) {
      setSnackbarColor('error');
      setSnackbarMessage('Invalid Sort Code. Format should be XX-XX-XX.');
      setSnackbarOpen(true);
      return;
    }

    if (!isValidAccountNumber(formData.accountNo)) {
      setSnackbarColor('error');
      setSnackbarMessage('Invalid Account Number. It should be 8 digits.');
      setSnackbarOpen(true);
      return;
    }

    try {
      const bankDetailsRef = collection(db, 'BankDetails');
      const bankDetailsQuery = query(bankDetailsRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(bankDetailsQuery);

      let quantumKey;
      let encryptedQuantumKey;
      if (userDetails && userDetails.quantumKey) {
        console.log("inside");
        encryptedQuantumKey = userDetails.quantumKey;
        console.log("ENCQU"+encryptedQuantumKey);
        quantumKey = decryptQuantumKey(encryptedQuantumKey);  // <-- Decrypt before using
        console.log(quantumKey);
      } else {
        console.log("inside else:")
        quantumKey = await fetchQuantumRandomNumber();
        if(quantumKey) { 
          encryptedQuantumKey = encryptQuantumKey(quantumKey);  // <-- Encrypt before saving
        }
      }
      //debugging
      // if (quantumKey || encryptedQuantumKey) { // Check if both keys are available
      //   console.log("Quantum key: "+ quantumKey + "Encrypted: "+encryptedQuantumKey)
      // }
      // if (!quantumKey || !encryptedQuantumKey) { // Check if both keys are available
      //   throw new Error("Failed to obtain quantum key for encryption.");
      // }

      const encryptedData = {
        firstName: encrypt(formData.firstName, quantumKey),
        lastName: encrypt(formData.lastName, quantumKey),
        sortCode: encrypt(formData.sortCode, quantumKey),
        accountNo: encrypt(formData.accountNo, quantumKey),
        uid: user.uid,
        q2: encryptedQuantumKey 
      };

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, encryptedData);
      } else {
        await addDoc(bankDetailsRef, encryptedData);
      }
      console.log('Quantum Key:', quantumKey);
      console.log('Encrypted Quantum Key:', encryptedQuantumKey);
      setUserDetails(formData);
      setEditing(false);
      setSnackbarColor('success');
      setSnackbarMessage('Details saved successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarColor('error');
      setSnackbarMessage('Error saving details.');
      console.log(error);
      setSnackbarOpen(true);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const formatSortCode = (value) => {
    const cleanValue = value.replace(/-/g, '');
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 4) return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2)}`;
    return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 4)}-${cleanValue.slice(4, 6)}`;
  };

  const isValidSortCode = (sortCode) => {
    return /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(sortCode);
  };
  
  const isValidAccountNumber = (accountNumber) => {
    return /^[0-9]{8}$/.test(accountNumber);
  };

  if (loading || user == null) {
    return <h1>Loading...</h1>;
  }
  if (user==null) {
    return <h1>Sorry you don't have permission to view this page</h1>
  }
  return (
    <Layout>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 3,
          }}
        >
          {!editing && userDetails ? (
            <>
              <Typography variant="h4" gutterBottom>
                Your Details
              </Typography>
              <Typography variant="body1">First Name: {userDetails.firstName}</Typography>
              <Typography variant="body1">Last Name: {userDetails.lastName}</Typography>
              <Typography variant="body1">Sort Code: {userDetails.sortCode}</Typography>
              <Typography variant="body1">Account Number: {userDetails.accountNo}</Typography>
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleEdit}>
                Edit Details
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h4" gutterBottom>
                {userDetails ? 'Edit Details' : 'Save your details'}
              </Typography>
              <form onSubmit={handleSubmit} sx={{ width: '100%', mt: 3 }}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                />
                <TextField
                  name="sortCode"
                  label="Sort Code"
                  value={formData.sortCode}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                />
                <TextField
                  name="accountNo"
                  label="Account Number"
                  value={formData.accountNo}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  {userDetails ? 'Update Details' : 'Submit'}
                </Button>
              </form>
            </>
          )}
        </Paper>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          sx={{ backgroundColor: snackbarColor === 'success' ? 'green' : 'red' }}
        />
      </Container>
    </Layout>
  );
};

export default Home;
