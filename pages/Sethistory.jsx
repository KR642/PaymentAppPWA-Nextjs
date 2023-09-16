// import { useEffect, useState } from 'react';
// import { useUserAuth } from '@/context/UserAuthContext';
// import { getDocs, query, where, collection } from "firebase/firestore";
// import { db } from '@/config/firebase';
// import { Button, TextField, Container, Typography, Paper, CssBaseline, Box, List, ListItem,ListItemText, Divider } from '@mui/material';
// import Layout from './components/Layout';

// export default function SetHistory() {
//   const { user } = useUserAuth();
//   const [settlements, setSettlements] = useState([]);

//   useEffect(() => {
//     if (!user || !user.email) {
//       // user is not available yet
//       return;
//     }

//     // Create a query against the collection.
//     const q = query(collection(db, "PaymentRequests"), 
//       where("sentTo", "==", user.email),
//       where("settleStatus", "in", ["Settled", "Approved"])
//     );

//     const fetchData = async () => {
//       const querySnapshot = await getDocs(q);
//       const tempData = [];
//       querySnapshot.forEach((doc) => {
//         tempData.push({ id: doc.id, ...doc.data() });
//       });
//       setSettlements(tempData);
//     };

//     fetchData();
//   }, [user]);

//   return (
//     <Layout>
//       <Container component="main" maxWidth="xs">
//         <CssBaseline />
//         <Typography variant="h4" gutterBottom sx={{textAlign:'center'}}>
//           Settlement history
//         </Typography>
//         <Paper 
//           elevation={0} 
//           sx={{
//             marginTop: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'flex-start',
//             padding: 3,
//             borderRadius: 3,
//             backgroundColor:'transparent'
//           }}
//         >
//           <List>
//             {settlements.map((request) => (
//               <ListItem key={request.id}>
//                 <ListItemText
//                   primary={`Request amount: ${request.amount} for ${request.description} ${request.sentTo}`}
//                   secondary={
//                     request.settleStatus === 'Settled'
//                       ? `The request of amount : ${request.amount} for ${request.description} has been settled.`
//                       : `The request of amount : ${request.amount} for ${request.description} has been approved.`
//                   }
//                 />
//                 <Divider />
//               </ListItem>
//             ))}
//           </List>
//         </Paper>
//       </Container>
//     </Layout>
//   );
// }


import { useEffect, useState } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
import { getDocs, query, where, collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from '@/config/firebase';
import { decryptData, decryptQ2 } from '@/utilities/encryptionMethods'; // Assuming you've written this function
import { Button, Typography, Paper, CssBaseline, List, ListItem,ListItemText, ListItemTextDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Dialog, Stack } from '@mui/material';
import Layout from './components/Layout';
import PendingIcon from '@mui/icons-material/Pending';  
import DoneIcon from '@mui/icons-material/Done';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Sethistory() {

  const { user } = useUserAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [settledRequests, setSettledRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const handleClickOpen = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };


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
  

    const q1 = query(collection(db, "PaymentRequests"), 
    where("sentTo", "==", user.email),
    where("settleStatus", "in", ["Settled", "Approved"])
  );

    const q2 = query(collection(db, "PaymentRequests"),
      where("sentTo", "==", user.email),
      where("settleStatus", "==", "Approved")
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

  const allRequests = [...pendingRequests];


  const handleSettleStatus = async (requestId, newStatus) => {
    const requestRef = doc(db, "PaymentRequests", requestId);
    await updateDoc(requestRef, {
      settleStatus: newStatus,
    });
  };

  return (
    <Layout>
      <CssBaseline />
      <Typography variant="h5" gutterBottom sx={{textAlign:'center'}}>
        Settlement History
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
                  request.settleStatus === 'Settled'
                  ? `£${request.amount} has been received by ${request.bankDetails.firstName} ${request.bankDetails.lastName} `
                  : `£${request.amount} has been approved by ${request.bankDetails.firstName} ${request.bankDetails.lastName}`
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
          <DialogTitle sx={{color:'black'}}>
          {selectedRequest ? (
      selectedRequest.settleStatus === 'Settled'
      ? `Description`
      : null
    ) : 'Loading...'}
            
            </DialogTitle>
          <DialogContent>
  <DialogContentText>
    {selectedRequest ? (
      selectedRequest.settleStatus === 'Settled' || selectedRequest.settleStatus === 'Approved'
      ? <Stack>
        <Typography sx={{
        color:'black'
      }}>{`Amount: ${selectedRequest.amount}`}</Typography>

      <Typography sx={{color:'black'}}>{`Description: ${selectedRequest.description}`}</Typography>
      <Typography sx={{color:'black'}}>{`Initiated By: ${selectedRequest.bankDetails.firstName} ${selectedRequest.bankDetails.lastName}`}</Typography>
      <Typography sx={{color:'black'}}>{`Settle Status: ${selectedRequest.settleStatus}`}</Typography>
        </Stack>
      
      : null
    ) : 'Loading...'}
  </DialogContentText>
</DialogContent>
<DialogActions>
  
  {selectedRequest && (
    <Button 
      color="primary"
    >
      <CheckCircleIcon sx={{color:'green'}}/>
    </Button>
  )}
  <Button onClick={handleClose} color="primary">
    Close
  </Button>
</DialogActions>
        </Dialog>
      </Paper>
    </Layout>
  );
}






