import Link from 'next/link';
import { Button, Container, Typography, Box, CssBaseline, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const StyledContainer = styled(Container)`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
`;

export default function Welcome() {
  return (
    <StyledContainer component="main" maxWidth="xs">
      <CssBaseline />
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          boxShadow: 3,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h4" gutterBottom>
          Thanu's Money App
        </Typography>
        <Typography variant="h6" gutterBottom>
          Janakodilaude vishwasthasthasthapanam
        </Typography>
        <Box mt={5} sx={{ width: '100%' }}>
          <Link href="/Login" passHref>
            <Button 
              variant="contained" 
              color="primary" 
              style={{ marginRight: '1rem', width: '45%' }}
            >
              Login
            </Button>
          </Link>
          <Link href="/Register" passHref>
            <Button 
              variant="outlined" 
              color="primary" 
              style={{ width: '45%' }}
            >
              Sign Up
            </Button>
          </Link>
        </Box>
      </Box>
    </StyledContainer>
  );
}
