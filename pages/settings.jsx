import React, { useEffect } from 'react'
import Layout from './components/Layout'
import { useUserAuth } from '@/context/UserAuthContext';
import { Box, Button, Container, CssBaseline, Fab, Paper, Typography } from '@mui/material';
import { auth } from '@/config/firebase';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import { useRouter } from 'next/router';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import InboxIcon from '@mui/icons-material/Inbox';

const Settings = () => {
    //security settings
    const { user } = useUserAuth();
    const router = useRouter();
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
        <Typography variant='h4' gutterBottom textAlign={'center'}>Settings</Typography>

        <Paper className='background-g'
        elevation={0}
        sx={{
          marginTop: 0,
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          width:'100%',
          justifyContent:'center'
        }}>
          
        
        <Box sx={{marginBottom:'5px', display:'flex', alignItems:'center', justifyContent:'left'}}>
          <HistoryIcon sx={{color:'white', marginRight:'2px'}}/>
        <a onClick={() => {
          router.push('/Reqhistory')
        }}>

        <Typography variant='h6'>Request History</Typography>

        </a>
        
        </Box>

        <Box sx={{marginBottom:'5px', display:'flex', alignItems:'center', justifyContent:'left'}}>
          <CallReceivedIcon sx={{color:'white', marginRight:'2px'}}/>
        <a onClick={() => {
          router.push('/Sethistory')
        }}>

        <Typography variant='h6'>Settlement History</Typography>

        </a>
        
        
        </Box>

        <Box sx={{marginBottom:'5px', display:'flex', alignItems:'center', justifyContent:'left'}}>
          <LogoutIcon sx={{color:'white', marginRight:'2px'}}/>
        <a onClick={logout}>

        <Typography variant='h6'>Logout</Typography>

        </a>
        
        
        </Box>
        
        {/* <Button variant='contained' startIcon={<LogoutIcon/>} onClick={logout}>Logout</Button> */}
        
        <Fab color="primary" aria-label="add" sx={{position: 'absolute', bottom:70, right:16}} onClick={() => {
          router.push('/Inbox');
        }}>
        <InboxIcon />
      </Fab>
        </Paper>

      </Container>
        
    </Layout>
    
  )
}

export default Settings