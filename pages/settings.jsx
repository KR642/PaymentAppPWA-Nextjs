import React, { useEffect } from 'react'
import Layout from './components/Layout'
import { useUserAuth } from '@/context/UserAuthContext';
import { Button, Typography } from '@mui/material';
import { auth } from '@/config/firebase';

const settings = () => {
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
      return <h1>Sorry you don't have permission to view this page</h1>
    }
  return (
    <Layout>
        <Typography variant='h4' gutterBottom textAlign={'center'}>Settings</Typography>
        <Button onClick={logout}>Logout</Button>
    </Layout>
    
  )
}

export default settings