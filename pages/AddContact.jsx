import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
import { collection, addDoc, getDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Layout from './components/Layout'
import { Button, TextField, Container, Typography, Paper, CssBaseline, Box, Snackbar } from '@mui/material';
import { encryptData, decryptQ2 } from '@/utilities/encryptionMethods';
const AddContact = () => {
  const { user } = useUserAuth();
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [q2, setQ2] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(''); // 'success' or 'error'

  useEffect(() => {
    const fetchQ2 = async () => {
      if (user && user.uid) { // Check if user and user.uid are available
        const BankDetailsref = collection(db, 'BankDetails');
        const q = query(BankDetailsref, where('userId', '==', user.uid));
  
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          
          querySnapshot.forEach((doc) => {
            setQ2(decryptQ2(doc.data().q2));
          });
          
        });
  
        return () => {
          // Unsubscribe from the real-time listener when the component unmounts
          unsubscribe();
        };
      }
    };
  
    fetchQ2();
  
  }, [user]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!isValidSortCode(sortCode) || !q2) {
      console.log("SortCode: " +sortCode);
      console.log("q2: " +q2);

      setSnackbarColor('error');
      setSnackbarMessage('Invalid data or Q2 not fetched.');
      setSnackbarOpen(true);
      return;
    }

    try {
      const contactRef = collection(db, 'Contacts');
      await addDoc(contactRef, {
        userId: user.uid,
        sortCode: encryptData(sortCode, q2),
        accountNo: encryptData(accountNumber, q2),
        firstName: encryptData(firstName, q2),
        lastName: encryptData(lastName, q2),
      });

      // Clear the input fields
      setSortCode('');
      setAccountNumber('');
      setFirstName('');
      setLastName('');

      setSnackbarColor('success');
      setSnackbarMessage('Contact added successfully!');
      setSnackbarOpen(true);

      setTimeout(() => {
        setSnackbarOpen(false);
        window.location.href = '/contact'; // Navigate to contact page
      }, 2000);
    } catch (error) {
      setSnackbarColor('error');
      setSnackbarMessage('Error adding contact.');
      setSnackbarOpen(true);
    }
  };

  const formatSortCode = (value) => {
    const cleanValue = value.replace(/-/g, '');
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 4) return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2)}`;
    return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 4)}-${cleanValue.slice(4, 6)}`;
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const isValidSortCode = (sortCode) => {
    return /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(sortCode);
  };
  
  const isValidAccountNumber = (accountNumber) => {
    return /^[0-9]{8}$/.test(accountNumber);
  };
  

  return (
    <Layout>
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper
      className='background-gradient'
        elevation={0}
        sx={{
          marginTop: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Add Contact
        </Typography>
        <form onSubmit={handleFormSubmit} sx={{ width: '100%', mt: 3 }}>
        <TextField
            label="Sort Code"
            type="text"
            value={sortCode}
            onChange={(e) => {
        const formattedValue = formatSortCode(e.target.value);
        if (formattedValue.length <= 8) {  // 2 characters + hyphen + 2 characters + hyphen + 2 characters
            setSortCode(formattedValue);
        }
    }}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
          <TextField
            label="Account Number"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
          <TextField
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
          <TextField
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />

<Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, borderRadius:'15px', backgroundColor: '#fff' }}>
            <p className='no-p'>Add Contact</p>
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        sx={{ backgroundColor: snackbarColor === 'success' ? 'green' : 'red' }}
      />
    </Container>
    </Layout>
  );
};

export default AddContact;
