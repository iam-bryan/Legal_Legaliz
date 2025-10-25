import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Typography, Alert, CircularProgress, Link
} from '@mui/material';
import apiService from '../api/apiService'; // Adjust path if needed
import { Grid } from '@mui/material';
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // To show success/error messages
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    try {
      // Call the API endpoint
      const response = await apiService.requestPasswordReset(email);
      // Display the generic success message from the API
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      // Display error from API or a generic one
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred. Please try again.'
      });
      console.error("Request Reset Error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          Enter your email address and we'll send you a link to reset your password (if an account exists).
        </Typography>
        <Box component="form" onSubmit={handleRequestReset} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          {/* Display Success or Error Messages */}
          {message && (
            <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
              {message.text}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !email} // Disable if loading or email is empty
          >
            {loading ? <CircularProgress size={24} color="inherit"/> : 'Send Reset Link'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Sign In
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;

