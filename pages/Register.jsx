import { useState } from 'react';
import Link from 'next/link';
import { Button, TextField, Container, Typography, Snackbar, CssBaseline, Box, Paper } from '@mui/material';
import Alert from '@mui/material/Alert';  // Note: Ensure you import Alert properly
import { useUserAuth } from '@/context/UserAuthContext';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { signUp } = useUserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signUp(email, password);
      setOpenSnackbar(true);
      setTimeout(() => {
        window.location.href = "/Login";
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper 
    
        elevation={0} 
        sx={{
          marginTop: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 3,
          backgroundColor:'transparent',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit} sx={{ width: '100%', mt: 3 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder='Enter Email Id'
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            type="password"
            placeholder='Enter Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, borderRadius:'15px', backgroundColor: '#fff' }}>
            <p className='no-p'>Sign Up</p>
          </Button>
          <Box mt={2} textAlign="center">
            <Typography>
              Already a user? <Link href="/Login">Login</Link>
            </Typography>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" elevation={6} variant="filled">
          Registered successfully. You are being redirected.
        </Alert>
      </Snackbar>
    </Container>
  );
}
