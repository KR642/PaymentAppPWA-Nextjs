import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUserAuth } from '@/context/UserAuthContext';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { decryptData, decryptQ2 } from '@/utilities/encryptionMethods';
import { Container,Button, Card, CardContent, CardHeader, Typography, IconButton } from '@mui/material';
import Layout from './components/Layout';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { TextField, FormControl, FormLabel } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';


const ViewContact = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserAuth();
  const [q2, setQ2] = useState(null);
  const [contact, setContact] = useState(null);
  const stripePromise = loadStripe('pk_test_51Nl0ikHeXPGD3OpRPcGcDiVnzWYjqDW1k9N5eEwdiJSI8919go9E2QAyRIZAJLapx6vmy23KiBL5gyi77L3sndSM00Spl83H9m');

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

  const [amount, setAmount] = useState(0);

  

  return (
    <Layout>
      <Container component="main" maxWidth="xs">
      <IconButton color="primary" onClick={goBack}>
          <ArrowBackIcon />
        </IconButton>
        {contact && (
          <Card elevation={3}>
            <CardHeader title={`${contact.firstName} ${contact.lastName}`} />
            <CardContent>
              <Typography variant="body1">
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
        )}

<FormControl component="fieldset" >
          <FormLabel component="legend" sx={{paddingTop:5, paddingBottom:2}}>Transfer Amount</FormLabel>
          <TextField
            label="Amount in GBP"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button variant="contained" color="primary">
            Transfer Money
          </Button>
         
        </FormControl>
      </Container>
    </Layout>
  );
};

export default ViewContact;
