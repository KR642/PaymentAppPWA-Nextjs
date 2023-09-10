import { useEffect, useState } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
import { getDocs, query, where, collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from '@/config/firebase';
import { decryptData, decryptQ2 } from '@/utilities/encryptionMethods'; // Assuming you've written this function
import { Button, Typography, Paper, CssBaseline, List, ListItem,ListItemText, ListItemTextDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Dialog } from '@mui/material';
import Layout from './components/Layout';
import PendingIcon from '@mui/icons-material/Pending';  
import DoneIcon from '@mui/icons-material/Done';


export default function Inbox() {

  const { user } = useUserAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [settledRequests, setSettledRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const handleClickOpen = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };


  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Unable to get permission to notify.');
      }
    });
  }, []);

  const showNotification = (title, body) => {
    new Notification(title, { body });
  };

  // Function to close modal
  const handleClose = () => {
    setOpen(false);
  };
  const fetchAndDecryptBankDetails = async (userId) => {
    try {
      const bankDetailsRef = collection(db, 'BankDetails');
      const q = query(bankDetailsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.error("No bank details found");
        return null;
      }
    
      const docData = querySnapshot.docs[0].data();
      const { firstName, lastName, sortCode, accountNo, q2 } = docData;
    
      if (!firstName || !lastName || !sortCode || !accountNo || !q2) {
        console.error("Incomplete data");
        return null;
      }
    
      // Decrypt q2 to get the Quantum Key
      const decryptedQuantumKey = decryptQ2(q2);
    
      // Use the Quantum Key to decrypt other fields
      const decryptedFirstName = decryptData(firstName, decryptedQuantumKey);
      const decryptedLastName = decryptData(lastName, decryptedQuantumKey);
      const decryptedSortCode = decryptData(sortCode, decryptedQuantumKey);
      const decryptedAccountNo = decryptData(accountNo, decryptedQuantumKey);
    
      if (!decryptedFirstName || !decryptedLastName || !decryptedSortCode || !decryptedAccountNo) {
        console.error("Decryption failed");
        return null;
      }
    
      const decryptedDetails = {
        firstName: decryptedFirstName,
        lastName: decryptedLastName,
        sortCode: decryptedSortCode,
        accountNo: decryptedAccountNo,
        quantumKey: decryptedQuantumKey
      };
    
      return decryptedDetails;
    } catch (error) {
      console.error("Error fetching and decrypting bank details:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user || !user.email || !user.uid) {
      return;
    }

    let oldPendingLength = 0;
    let oldSettledLength = 0;
  

    const q1 = query(collection(db, "PaymentRequests1"), 
      where("sentTo", "==", user.email),
      where("settleStatus", "==", "Pending")
    );

    const q2 = query(collection(db, "PaymentRequests1"),
      where("initiatedBy", "==", user.uid),
      where("settleStatus", "==", "Settled")
    );

    const unsubscribe1 = onSnapshot(q1, async (querySnapshot) => {
      const newPendingLength = querySnapshot.size;
    // if (newPendingLength > oldPendingLength) {
    //   showNotification('New Pending Request', 'You have a new pending request.');
    // }
    oldPendingLength = newPendingLength;
      const pendingDocs = [];
      const newPendingDocs = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const userId = data.initiatedBy;
        const decryptedDetails = await fetchAndDecryptBankDetails(userId);
        pendingDocs.push({ ...data, id: doc.id, bankDetails: decryptedDetails });
      }
      // if (newPendingDocs.length > pendingRequests.length) {
      //   showNotification('New Pending Request', 'You have a new pending request.');
      // }
      setPendingRequests(newPendingDocs);
      setPendingRequests(pendingDocs);
    });

    const unsubscribe2 = onSnapshot(q2, async (querySnapshot) => {
      const newSettledLength = querySnapshot.size;
    // if (newSettledLength > oldSettledLength) {
    //   showNotification('Request Settled', 'One of your requests has been settled.');
    // }
    oldSettledLength = newSettledLength;
      const settledDocs = [];
      const newSettledDocs = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const userId = data.initiatedBy;
        const decryptedDetails = await fetchAndDecryptBankDetails(userId);
        settledDocs.push({ ...data, id: doc.id, bankDetails: decryptedDetails });
      }
      // if (newSettledDocs.length > settledRequests.length) {
      //   showNotification('Request Settled', 'One of your requests has been settled.');
      // }
      setSettledRequests(newSettledDocs);
      setSettledRequests(settledDocs);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user]);

  const allRequests = [...pendingRequests, ...settledRequests];

  const handleSettleStatus = async (requestId, newStatus) => {
    const requestRef = doc(db, "PaymentRequests1", requestId);
    await updateDoc(requestRef, {
      settleStatus: newStatus,
    });
  };

  return (
    <Layout>
      <CssBaseline />
      <Typography variant="h4" gutterBottom sx={{textAlign:'center'}}>
        Inbox
      </Typography>
      <Paper elevation={0} sx={{
        marginTop: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 3,
        borderRadius: 3,
        backgroundColor:'transparent'
      }}>
        <List>
          {allRequests.map((request, index) => (
            <ListItem key={index} button onClick={() => handleClickOpen(request)}>
              {request.settleStatus === 'Pending' ? (
        <PendingIcon sx={{color:'white'}} />
      ) : (
        <DoneIcon sx={{color:'white'}} />
      )}
              <ListItemText
                // primary={`Amount: ${request.amount}`}
                primary={
                  request.settleStatus === 'Pending'
                    ? `A request of amount: ${request.amount} from ${request.bankDetails.firstName} ${request.bankDetails.lastName} has been recieved for " ${request.description} "`
                    : `Amount: ${request.amount} you requested to ${request.sentTo} for ${request.description} is now settled. Please confirm if you have received this.`
                }
                sx={{
                  marginLeft:"1rem"
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Modal */}
        <Dialog open={open} onClose={handleClose} 
        sx={{ '& .MuiDialog-paper': { width: '50%', borderRadius: '12px' } }}>
          <DialogTitle sx={{color:'black'}}>{"Request Details"}</DialogTitle>
          <DialogContent>
  <DialogContentText>
    {selectedRequest ? (
      selectedRequest.settleStatus === 'Pending'
        ? `A request of amount: ${selectedRequest.amount} from ${selectedRequest.bankDetails.firstName} ${selectedRequest.bankDetails.lastName} has been received for " ${selectedRequest.description} "`
        : `Amount: ${selectedRequest.amount} you requested to ${selectedRequest.sentTo} for ${selectedRequest.description} is now settled. Please confirm if you have received this.`
    ) : 'Loading...'}
  </DialogContentText>
</DialogContent>
<DialogActions>
  <Button onClick={handleClose} color="primary">
    Cancel
  </Button>
  {selectedRequest && (
    <Button 
      onClick={() => {
        handleSettleStatus(selectedRequest.id, selectedRequest.settleStatus === 'Pending' ? 'Settled' : 'Approved');
        handleClose();
      }} 
      color="primary"
    >
      {selectedRequest.settleStatus === 'Pending' ? 'Settle' : 'Confirm'}
    </Button>
  )}
</DialogActions>
        </Dialog>
      </Paper>
    </Layout>
  );
}






