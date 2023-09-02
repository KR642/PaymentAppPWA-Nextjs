import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  collection, query, where, getDocs, updateDoc, addDoc
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import Layout from '../../pages/components/Layout';
import {
  Button, TextField, Container, Typography, Paper, CssBaseline, Snackbar
} from '@mui/material';

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
  useEffect(() => {
    if (user) {
      const fetchDetails = async () => {
        const bankDetailsRef = collection(db, 'BankDetails');
        const bankDetailsQuery = query(bankDetailsRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(bankDetailsQuery);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setUserDetails(docData);
          setFormData(docData);
        }
        setLoading(false);
      };

      fetchDetails();
    }
}, [user]);

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
      
      if (!querySnapshot.empty) {
        // User's bank details already exist. Update it.
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, formData);
      } else {
        // Add new bank details
        await addDoc(bankDetailsRef, {
          ...formData,
          uid: user.uid
        });
      }

      setUserDetails(formData);
      setEditing(false);
      setSnackbarColor('success');
      setSnackbarMessage('Details saved successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarColor('error');
      setSnackbarMessage('Error saving details.');
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
