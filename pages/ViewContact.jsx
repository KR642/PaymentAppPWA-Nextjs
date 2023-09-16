import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUserAuth } from '@/context/UserAuthContext';
import { addDoc, collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { decryptData, decryptQ2 } from '@/utilities/encryptionMethods';
import { Container,Button, Card, CardContent, CardHeader, Typography, IconButton, CssBaseline, Snackbar } from '@mui/material';
import Layout from './components/Layout';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Paper, TextField, FormControl, FormLabel } from '@mui/material';



const ViewContact = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserAuth();
  const [q2, setQ2] = useState(null);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState('');

  useEffect(() => {
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
    const fetchContact = async () => {
      if (user?.uid && id && q2) {
        const contactRef = doc(db, 'Contacts', id);
        const contactSnap = await getDoc(contactRef);

        if (contactSnap.exists()) {
          const decryptedData = {
            firstName: decryptData(contactSnap.data().firstName, q2),
            lastName: decryptData(contactSnap.data().lastName, q2),
            accountNo: decryptData(contactSnap.data().accountNo, q2),
            sortCode: decryptData(contactSnap.data().sortCode, q2),
            email: contactSnap.data().emailId,
          };
          setContact(decryptedData);
        }
      }
    };

    fetchContact();
  }, [user, id, q2]);

  const goBack = () => {
    router.back();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!amount || !desc) {
      setError('Both amount and description are required.');
      return;
    }
  
    try {
      const paymentRequestRef = collection(db, 'PaymentRequests');
      await addDoc(paymentRequestRef, {
        amount,
        description: desc,
        initiatedBy: user.uid,
        sentStatus: 'RequestSent',
        sentTo: contact ? contact.email : '', // Make sure contact.email exists
        settleStatus: 'Pending'
      });
      setError(null);
      setSnackbarMessage("The request has been sent.");
      setSnackbarOpen(true);
  
      setTimeout(() => {
        setSnackbarOpen(false);
        router.back(); // Navigate back
      }, 2000);
      // You can add logic here to notify the user of successful submission
    } catch (error) {
      setError('Error sending payment request.');
      console.error('Error sending payment request:', error);
    }
  };
  

  

  return (
    <Layout>
      <Container component="main" maxWidth="xs">
        <CssBaseline/>
        <Paper
          
          elevation={0}
          sx={{
            marginTop: 0,
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor:'transparent'
          }}
        >
      <IconButton className='fl' color="primary" onClick={goBack}>
          <ArrowBackIcon />
        </IconButton> 
        {/* {contact && (
          <Card elevation={2} sx={{backgroundColor:'transparent'}}>
            <CardHeader  title={`${contact.firstName} ${contact.lastName}`} />
            <CardContent >
              <Typography  variant="body1">
                <strong>First Name: </strong>{contact.firstName}
              </Typography>
              <Typography variant="body1">
                <strong>Last Name: </strong>{contact.lastName}
              </Typography>
              <Typography variant="body1">
                <strong>Account Number: </strong>{contact.accountNo}
              </Typography>
              <Typography variant="body1">
                <strong>Sort Code: </strong>{contact.sortCode}
              </Typography>
            </CardContent>
          </Card>
        )} */}

<form onSubmit={handleSubmit} sx={{ width: '100%', mt: 3 }}>
       
          <TextField
            label="Amount in GBP"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
          <TextField
            label="Description"
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
    
<Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, borderRadius:'15px', backgroundColor: '#fff' }}>
            <p className='no-p'>Sent Request to {contact && contact.firstName} {contact && contact.lastName}</p>
          </Button>
        </form>
        </Paper>
        <Snackbar
  open={snackbarOpen}
  autoHideDuration={2000}
  onClose={() => setSnackbarOpen(false)}
  message={snackbarMessage}
/>
      </Container>
    </Layout>
  );
};

export default ViewContact;
