import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Typography, Alert, CircularProgress, Link
} from '@mui/material';
import apiService from '../api/apiService'; // Adjust path if needed

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get the token from the URL (:token part)
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // To show success/error messages
  const [loading, setLoading] = useState(false);

  // Optional: Add a check on load to see if token is valid immediately? (More complex)

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    // Basic validation
    if (!password || password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }
    if (!token) {
        setMessage({ type: 'error', text: 'Invalid or missing reset token.' });
        setLoading(false);
        return;
    }

    try {
      // Call the API endpoint
      const response = await apiService.resetPassword(token, password);
      // Display success message and redirect after delay
      setMessage({ type: 'success', text: response.data.message + ' Redirecting to login...' });
      setTimeout(() => {
          navigate('/login');
      }, 3000); // 3-second delay
    } catch (error) {
      // Display error from API or a generic one
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred. Please try again or request a new link.'
      });
      console.error("Reset Password Error:", error.response || error);
      setLoading(false); // Keep form enabled on error
    }
    // No finally setLoading(false) here because we navigate away on success
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
          Reset Your Password
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          Enter your new password below.
        </Typography>
        <Box component="form" onSubmit={handleResetPassword} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || message?.type === 'success'} // Disable if loading or success
            helperText="Minimum 8 characters"
          />
           <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || message?.type === 'success'} // Disable if loading or success
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
            disabled={loading || message?.type === 'success'} // Disable if loading or success
          >
            {loading ? <CircularProgress size={24} color="inherit"/> : 'Reset Password'}
          </Button>
           {/* Optionally add a link back to login only if process succeeded */}
           {message?.type === 'success' && (
               <Link component={RouterLink} to="/login" variant="body2" sx={{display: 'block', textAlign: 'center'}}>
                 Go to Sign In
              </Link>
           )}
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;