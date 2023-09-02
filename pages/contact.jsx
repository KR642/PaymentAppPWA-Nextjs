import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Link from 'next/link';
import { useUserAuth } from '@/context/UserAuthContext';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { decryptData, decryptQ2 } from '@/utilities/encryptionMethods'; // Import decryptQ2
import { 
  Container, 
  Paper, 
  CssBaseline, 
  Typography, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton, 
  Button, 
  Modal,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const Contact = () => {
  const { user } = useUserAuth();
  const [contacts, setContacts] = useState([]);
  const [q2, setQ2] = useState(null); // State to hold decrypted q2
  const [modalOpen, setModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  useEffect(() => {
    // Fetch and decrypt q2 just like you did in AddContact
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
    
    // ... (rest of your code to fetch contacts remains here)
  }, [user]);

  useEffect(() => {
    if (user?.uid && q2) { // Make sure both user and decrypted q2 are available
      const contactsRef = collection(db, 'Contacts');
      const q = query(contactsRef, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const contactsData = [];
        querySnapshot.forEach((doc) => {
          const decryptedData = {
            id: doc.id,
            sortCode: decryptData(doc.data().sortCode, q2),
            accountNo: decryptData(doc.data().accountNo, q2),
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

  const handleEdit = (contact) => {
    window.location.href = `/EditContact?id=${contact.id}`;
  };

  const handleDelete = async () => {
    if (contactToDelete) {
      try {
        await deleteDoc(doc(db, 'Contacts', contactToDelete)); // <-- modified the delete path
        setModalOpen(false);
        setContactToDelete(null); // Reset the ID after deletion
      } catch (error) {
        console.error("Error deleting contact: ", error);
      }
    }
  };


  if (user === null) {
    return <h1>Sorry, you don't have permission to view this page</h1>;
  }

  return (
    <Layout>
      <Container component="main" maxWidth="md">
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
            overflowX: 'auto', // Allow horizontal scrolling if needed
          }}
        >
          <Typography variant="h4" gutterBottom>
            Contacts
          </Typography>
          {/* CTA Button using Next.js Link */}
          <Link href="/AddContact" passHref>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              sx={{ marginBottom: 3 }} // Add margin at the bottom
            >
              Add Contact
            </Button>
          </Link>
          <TableContainer sx={{ minWidth: '100%', paddingBottom: '2rem' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="subtitle1">
                        {contact.firstName} {contact.lastName}
                      </Typography>
                      <Typography variant="caption">
                        Sort Code: {contact.sortCode}, Account Number: {contact.accountNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(contact)}
                        aria-label="Edit"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
  onClick={() => {
    setContactToDelete(contact.id); 
    setModalOpen(true);
    console.log(contact.id);
  }
  }
  aria-label="Delete"
  color="secondary"
>
  <DeleteIcon />
</IconButton>
                    </TableCell>
                  </TableRow>
                ))}

<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Paper
          style={{
            position: 'absolute',
            width: 400,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '2em',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em'
          }}
        >
          <Typography variant="h6">Are you sure you want to delete this contact?</Typography>
          <div>
            <Button variant="outlined" color="primary" onClick={() => setModalOpen(false)}>No</Button>
            <Button variant="contained" color="secondary" onClick={handleDelete}>Yes</Button>
          </div>
        </Paper>
      </Modal>

              </TableBody>
             
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Contact;
