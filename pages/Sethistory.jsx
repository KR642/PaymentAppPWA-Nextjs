import { useEffect, useState } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from '@/config/firebase';
import { Button, TextField, Container, Typography, Paper, CssBaseline, Box, List, ListItem,ListItemText, Divider } from '@mui/material';
import Layout from './components/Layout';

export default function SetHistory() {
  const { user } = useUserAuth();
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    if (!user || !user.email) {
      // user is not available yet
      return;
    }

    // Create a query against the collection.
    const q = query(collection(db, "PaymentRequests"), 
      where("sentTo", "==", user.email),
      where("settleStatus", "in", ["Settled", "Approved"])
    );

    const fetchData = async () => {
      const querySnapshot = await getDocs(q);
      const tempData = [];
      querySnapshot.forEach((doc) => {
        tempData.push({ id: doc.id, ...doc.data() });
      });
      setSettlements(tempData);
    };

    fetchData();
  }, [user]);

  return (
    <Layout>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Typography variant="h4" gutterBottom sx={{textAlign:'center'}}>
          Settlement history
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
            {settlements.map((request) => (
              <ListItem key={request.id}>
                <ListItemText
                  primary={`Request amount: ${request.amount} for ${request.description}`}
                  secondary={
                    request.settleStatus === 'Settled'
                      ? `The request of amount : ${request.amount} for ${request.description} has been settled.`
                      : `The request of amount : ${request.amount} for ${request.description} has been approved.`
                  }
                />
                <Divider />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </Layout>
  );
}
