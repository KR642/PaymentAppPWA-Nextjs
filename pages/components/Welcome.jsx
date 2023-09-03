import Link from 'next/link';
import {Paper, Button, Container, Typography, Box, CssBaseline, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const StyledContainer = styled(Container)`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

export default function Welcome() {
  return (
    <StyledContainer component="main" maxWidth="xs">
      <CssBaseline />
      <Paper

          elevation={0}
          sx={{
            marginTop: 0,
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor:'transparent'
          }}
        >
      <Box 

        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 2,
          backgroundColor: '#transparent',
          boxShadow: 3,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h4" gutterBottom>
          Payment App
        </Typography>
        <Box mt={5} sx={{ width: '100%' }}>
          <Link href="/Login" passHref>
            <Button 
              variant="contained" 
              color='primary'
              sx={{backgroundColor:'#ffff', color:'#000', borderRadius:'15px'}}
              style={{ marginRight: '1rem', width: '45%'}}
            >
              Login
            </Button>
          </Link>
          <Link href="/Register" passHref>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{backgroundColor:'transparent', color:'#000', borderColor:'#fff', borderRadius:'15px'}}
              style={{ width: '45%' }}
            >
              Sign Up
            </Button>
          </Link>
        </Box>
      </Box>
      </Paper>
    </StyledContainer>
  );
}
