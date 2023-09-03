import React, { useEffect } from 'react'
import Layout from './components/Layout'
import { useUserAuth } from '@/context/UserAuthContext';
import { Button, Container, CssBaseline, Paper, Typography } from '@mui/material';
import { auth } from '@/config/firebase';

const Settings = () => {
    //security settings
    const { user } = useUserAuth();

    useEffect(() => {
      if (user==null && typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }, [user]);

    const logout = () => {
      auth.signOut().then(() => {
        console.log('Logged out');
        // Navigate to login page or do something else
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      });
    };
    if (user==null) {
      return <h1>Sorry you dont have permission to view this page</h1>
    }
  return (
    <Layout>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Paper className='background-gradient'
        elevation={0}
        sx={{
          marginTop: 0,
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          
      <Typography variant='h4' gutterBottom textAlign={'center'}>Settings</Typography>
        <Button onClick={logout}>Logout</Button>
        </Paper>

      </Container>
        
    </Layout>
    
  )
}

export default Settings