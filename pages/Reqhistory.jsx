import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserAuth } from '@/context/UserAuthContext';
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from '@/config/firebase';
import { Button, TextField, Container, Typography, Paper, CssBaseline, Box, List, ListItem,ListItemText, Divider } from '@mui/material';
import Layout from './components/Layout'
export default function ReqHistory() {

  const {user} = useUserAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user || !user.uid) {
      // user is not available yet
      return;
    }
    // Create a query against the collection.
    const q = query(collection(db, "PaymentRequests"), 
      where("initiatedBy", "==", user.uid),
      where("settleStatus", "in", ["Pending", "Approved"])
    );
  
    const fetchData = async () => {
      const querySnapshot = await getDocs(q);
      const tempData = [];
      querySnapshot.forEach((doc) => {
        tempData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(tempData);
    };
  
    fetchData();
  }, [user]);


  return (
    <Layout>
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Typography variant="h4" gutterBottom sx={{textAlign:'center'}}>
          Request history
        </Typography>
      <Paper 
      
        elevation={0} 
        sx={{
          marginTop: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: 3,
          borderRadius: 3,
          backgroundColor:'transparent'
        }}
      >
       

       <List>
        {requests.map((req) => (
          <ListItem key={req.id}>
            <ListItemText
              primary={`Request sent to: ${req.sentTo}`}
              secondary={
                req.settleStatus === 'Pending'
                  ? `The request of amount : ${req.amount} for ${req.description} is pending.`
                  : `The request of amount : ${req.amount} for ${req.description} has been Approved.`
              }
            />
          </ListItem>
        ))}
      </List>

        
      </Paper>
    </Container>
    </Layout>
  );
}
