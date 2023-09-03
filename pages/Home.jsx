import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserAuth } from '@/context/UserAuthContext';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  collection, query, where, getDocs, updateDoc, addDoc,onSnapshot 
} from 'firebase/firestore';
import { decryptData, decryptQ2 } from '@/utilities/encryptionMethods'; // Import decryptQ2

import { db } from '@/config/firebase';
import Layout from './components/Layout';
import {
  Button,
  TextField,
  Container, 
  Typography, 
  Paper, 
  CssBaseline, 
  Snackbar, 
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const Home = () => {
  const router = useRouter();
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
  const [contacts, setContacts] = useState([]);
  const [q2, setQ2] = useState(null);
  const [selectedContact, setSelectedContact] = useState('');
  

  const fetchQuantumRandomNumber = async () => {
    // const response = await fetch('/api/getQuantumNumber');
    //   const data = await response.json();
    const randomNum = 64070;
    return randomNum;
    // return data.randomNumber;
  };
  
  const crypto = require('crypto');
  
  const getKeyFromNumber = (num) => {
    // console.log(crypto.createHash('sha256').update(String(num)).digest());
    return crypto.createHash('sha256').update(String(num)).digest();
  };
  
  const encryptQuantumKey = (key) => {
    // Replace `masterKey` with your actual master key
    const masterKey = 'Fuzzy9Platypus$RainDance!';
    return encrypt(String(key), masterKey);
  };
  
  // Function to decrypt Quantum Key
  const decryptQuantumKey = (encryptedKey) => {
    // Replace `masterKey` with your actual master key
    const masterKey = 'Fuzzy9Platypus$RainDance!';
    return decrypt(encryptedKey, masterKey);
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
    if (user?.uid && q2) {
      const contactsRef = collection(db, 'Contacts');
      const q = query(contactsRef, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const contactsData = [];
        querySnapshot.forEach((doc) => {
          const decryptedData = {
            id: doc.id,
            firstName: decryptData(doc.data().firstName, q2),
            lastName: decryptData(doc.data().lastName, q2),
          };
          contactsData.push(decryptedData);
        });
        setContacts(contactsData);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user, q2]);

  const handleChange = (event) => {
    const contactId = event.target.value;
    setSelectedContact(contactId);

    // Navigate to ViewContact page with the selected contact ID
    router.push(`/ViewContact?id=${contactId}`);  };
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!user) return;  // Return if user is not present
      setLoading(true);
      try {
        const bankDetailsRef = collection(db, 'BankDetails');
        const bankDetailsQuery = query(bankDetailsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(bankDetailsQuery);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const { firstName, lastName, sortCode, accountNo, q2 } = docData;

          if (!firstName || !lastName || !sortCode || !accountNo || !q2) {
            console.error("Incomplete data");
            return;
          }
        //   console.log('Encrypted first name:', firstName);
        // console.log('Quantum key:', q2);

          const decryptedFirstName = decrypt(firstName, decryptQuantumKey(q2));
          const decryptedLastName = decrypt(lastName, decryptQuantumKey(q2));
          const decryptedSortCode = decrypt(sortCode, decryptQuantumKey(q2));
          const decryptedAccountNo = decrypt(accountNo, decryptQuantumKey(q2));
          const decryptedQuantumKey = decryptQuantumKey(docData.q2);

          // console.log(decryptQuantumKey(q2));

          if (!decryptedFirstName || !decryptedLastName || !decryptedSortCode || !decryptedAccountNo) {
            console.error("Decryption failed");
            return;
          }

          const newDetails = {
            firstName: decryptedFirstName,
            lastName: decryptedLastName,
            sortCode: decryptedSortCode,
            accountNo: decryptedAccountNo,
            quantumKey: decryptedQuantumKey
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
      const bankDetailsQuery = query(bankDetailsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(bankDetailsQuery);

      let quantumKey;
      if (userDetails && userDetails.quantumKey) {
        quantumKey = userDetails.quantumKey;
      } else {
        quantumKey = await fetchQuantumRandomNumber();
      }
      const encryptedQuantumKey = encryptQuantumKey(quantumKey);
      const encryptedData = {
        firstName: encrypt(formData.firstName, quantumKey),
        lastName: encrypt(formData.lastName, quantumKey),
        sortCode: encrypt(formData.sortCode, quantumKey),
        accountNo: encrypt(formData.accountNo, quantumKey),
        userId: user.uid,
        q2: encryptedQuantumKey
      };

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, encryptedData);
      } else {
        await addDoc(bankDetailsRef, encryptedData);
      }

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
    return <h1>Sorry you dont have permission to view this page</h1>
  }
  return (
    
<Layout>
      <Container component="main" maxWidth="xs" >
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
            borderRadius: 0,
          }}
        >
          {!editing && userDetails ? (
            <>
              <Typography variant="body1">First Name: {userDetails.firstName}</Typography>
              <Typography variant="body1">Last Name: {userDetails.lastName}</Typography>
              <Typography variant="body1">Sort Code: {userDetails.sortCode}</Typography>
              <Typography variant="body1">Account Number: {userDetails.accountNo}</Typography>
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, borderRadius:'15px', backgroundColor: '#fff' }} onClick={handleEdit}>
                <p className='no-p'>Edit Details</p>
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
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, borderRadius:'15px', backgroundColor: '#fff'  }}>
                  {userDetails ? <p className='no-p'>Update Details</p> : <p className='no-p'>Save Details</p>}
                </Button>
              </form>
            </>
          )}
          {contacts.length > 0 && (
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="contact-select-label">Select a Contact</InputLabel>
            <Select
              labelId="contact-select-label"
              id="contact-select"
              value={selectedContact}
              onChange={handleChange}
              label="Select a Contact"
            >
              {contacts.map((contact) => (
                <MenuItem key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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