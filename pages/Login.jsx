import { useState } from 'react';
import Link from 'next/link';
import { Button, TextField, Container, Typography, Paper, CssBaseline, Box } from '@mui/material';
import { useUserAuth } from '@/context/UserAuthContext';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { logIn } = useUserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await logIn(email, password);
      window.location.href = "/Home";
    } catch (err) {
      setError(err.message);
    }
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
          backgroundColor:'transparent'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit} sx={{ width: '100%', mt: 3 }}>
        <TextField
      
  label="Username"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  variant="outlined"
  margin="normal"
  placeholder='Enter UserName'
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
  placeholder='Enter Password'
  type="password"
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
           <p className='no-p'>Login</p> 
          </Button>
          <Box mt={2} textAlign="center">
            <Typography>
              Dont have an account? <Link href="/Register">Sign Up</Link>
            </Typography>
            <Typography mt={1}>
              Forgot Password? <Link href="/forgotpassword">Click here</Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
