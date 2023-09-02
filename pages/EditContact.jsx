import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useUserAuth } from '@/context/UserAuthContext';
import { decryptData, encryptData, decryptQ2 } from '@/utilities/encryptionMethods'; // Don't forget to import these

import {
    Container,
    Paper,
    CssBaseline,
    Typography,
    Button,
    TextField,
    Grid,
    Snackbar
  } from '@mui/material';
import Layout from './components/Layout';
import { db } from '@/config/firebase';

const EditContact = ({ id }) => {
  const { user } = useUserAuth(); // Add this line to get the user
  const [contact, setContact] = useState(null);
  const [q2, setQ2] = useState(null); // State to hold decrypted q2
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  useEffect(() => {
    // Fetch and decrypt q2 just like you did in AddContact and Contact pages
    const fetchQ2 = async () => {
      if (user && user.uid) {
        const BankDetailsRef = collection(db, 'BankDetails');
        const q = query(BankDetailsRef, where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setQ2(decryptQ2(doc.data().q2));
          });
        });
        return () => {
          unsubscribe();
        };
      }
    };

    fetchQ2();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !q2) return; // Add q2 in the check
      const contactRef = doc(db, 'Contacts', id);
      const contactDoc = await getDoc(contactRef);

      if (contactDoc.exists()) {
        const decryptedData = {
          // Decrypt the data here
          firstName: decryptData(contactDoc.data().firstName, q2),
          lastName: decryptData(contactDoc.data().lastName, q2),
          sortCode: decryptData(contactDoc.data().sortCode, q2),
          accountNo: decryptData(contactDoc.data().accountNo, q2),
        };

        setContact(decryptedData);
      }
    };

    fetchData();
  }, [id, q2]);

  const handleSave = async () => {
    if (!isValidSortCode(contact.sortCode)) {
        setSnackbarMessage('Invalid Sort Code. Format should be XX-XX-XX.');
        setSnackbarOpen(true);
        return;
      }
  
      if (!isValidAccountNumber(contact.accountNo)) {
        setSnackbarMessage('Invalid Account Number. It should be 8 digits.');
        setSnackbarOpen(true);
        return;
      }
    try {
      const encryptedData = {
        firstName: encryptData(contact.firstName, q2),
        lastName: encryptData(contact.lastName, q2),
        sortCode: encryptData(contact.sortCode, q2),
        accountNo: encryptData(contact.accountNo, q2),
      };

      const contactRef = doc(db, 'Contacts', id);
      await updateDoc(contactRef, encryptedData);
        setSnackbarMessage('Contact updated successfully');
        setSnackbarOpen(true);
  
        setTimeout(() => {
          setSnackbarOpen(false);
          window.location.href = '/contact'; // Navigate to contact page
        }, 2000);
      } catch (error) {
      console.error("Error updating contact: ", error);
      setSnackbarMessage('Error updating contact');
      setSnackbarOpen(true);
    }
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

  const formatSortCode = (value) => {
    const cleanValue = value.replace(/-/g, '');
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 4) return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2)}`;
    return `${cleanValue.slice(0, 2)}-${cleanValue.slice(2, 4)}-${cleanValue.slice(4, 6)}`;
  };

  if (!contact) return 'Loading...';

  return (
    <Layout>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Edit Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                fullWidth
                label="First Name"
                value={contact.firstName}
                onChange={e => setContact(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                fullWidth
                label="Last Name"
                value={contact.lastName}
                onChange={e => setContact(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                fullWidth
                label="Sort Code"
                value={contact.sortCode}
                onChange={e => {
                    const formattedValue = formatSortCode(e.target.value);
                    if (formattedValue.length <= 8) {
                        setContact(prev => ({ ...prev, sortCode: formattedValue }));
                    }
                }}
                              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                fullWidth
                label="Account Number"
                value={contact.accountNo}
                onChange={e => setContact(prev => ({ ...prev, accountNo: e.target.value }))}
              />
            </Grid>
            {/* Add more fields like Sort Code and Account Number here, similar to above */}
          </Grid>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Paper>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Layout>
  );
};

export async function getServerSideProps(context) {
    return {
      props: {
        id: context.query.id,  
      }
    };
  }

export default EditContact;
