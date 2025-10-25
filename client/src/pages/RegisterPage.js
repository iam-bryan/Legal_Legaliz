import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, Grid, Link } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const RegisterPage = () => {
  // ... (useState hooks are the same)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    axios.post(`${API_URL}/auth/register.php`, {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password
    }).then(response => {
      setSuccess('Registration successful! Redirecting to login...');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
    }).catch(error => {
      // THIS IS THE KEY CHANGE FOR DEBUGGING
      console.error("Registration API Error:", error.response); // Log the full error object
      
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        "A network error occurred. Please check the console for details.";
      
      // Also display the detailed PHP error if available
      const detailedError = (error.response && error.response.data && error.response.data.error) 
        ? `: ${error.response.data.error}` 
        : '';

      setError(resMessage + detailedError);
      setLoading(false);
    });
  };

  // ... (return JSX is the same)
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Create Account</Typography>
        <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" required fullWidth id="firstName" label="First Name" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth id="lastName" label="Last Name" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth id="email" label="Email Address" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>{loading ? 'Creating Account...' : 'Sign Up'}</Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">Already have an account? Sign in</Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;