import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, TextField, Container, Typography, Paper, CssBaseline, Box } from '@mui/material';
import Link from 'next/link';
import { useUserAuth } from '@/context/UserAuthContext';  // Path might differ based on your folder structure

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { resetPassword } = useUserAuth();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await resetPassword(email);
            setMessage('Password reset link sent to your email.');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Paper 
                className='bgbg'
                elevation={0} 
                sx={{
                    marginTop: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 3,
                    borderRadius: 3
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Forgot Password
                </Typography>
                <form onSubmit={handleResetPassword} sx={{ width: '100%', mt: 3 }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    {message && <Typography color="primary">{message}</Typography>}
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Reset Password
                    </Button>
                    <Box mt={2} textAlign="center">
                        <Typography>
                            Remember your password? <Link href="/Login">Login</Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
