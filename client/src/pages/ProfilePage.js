import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Grid, Card, CardContent, CardHeader, Divider } from '@mui/material';
import apiService from '../api/apiService';
import authService from '../api/authService'; // To get current user details initially

const ProfilePage = () => {
  // Get initial user data SAFELY
  const initialUser = authService.getCurrentUser() || {}; // Use empty object as fallback

  // Safely initialize state
  const [firstName, setFirstName] = useState(initialUser.name?.split(' ')[0] || ''); // Optional chaining ?.
  const [lastName, setLastName] = useState(initialUser.name?.split(' ').slice(1).join(' ') || ''); // Optional chaining ?.
  const [email, setEmail] = useState(initialUser.email || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    apiService.getMyProfile()
      .then(response => {
        const profile = response.data;
        if (profile) { // Check if profile data exists
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setEmail(profile.email || '');
        } else {
           setError('Could not load profile data.'); // Handle case where API returns empty
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile details.');
        console.error("Fetch Profile Error:", err.response || err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!firstName || !email) {
      setError("First Name and Email are required.");
      setIsSubmitting(false);
      return;
    }

    const profileData = { first_name: firstName, last_name: lastName, email: email };

    apiService.updateMyProfile(profileData)
      .then(response => {
        setSuccess(response.data.message || 'Profile updated successfully!');
        // Update local storage user details SAFELY
        const updatedUser = { ...initialUser, name: `${firstName} ${lastName}`, email: email };
        if (initialUser.id) { // Only update if initialUser was valid
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        // TODO: Trigger a global state update or page reload if Header needs immediate update
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to update profile.');
        console.error("Update Profile Error:", err.response || err);
      })
      .finally(() => {
          setIsSubmitting(false);
      });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // Main render logic (remains the same as before)
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>My Profile</Typography>
      {error && !isSubmitting && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardHeader title="Account Details" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                 <TextField required fullWidth id="firstName" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSubmitting} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <TextField fullWidth id="lastName" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSubmitting} margin="normal" />
              </Grid>
              <Grid item xs={12}>
                 <TextField required fullWidth id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} margin="normal" />
              </Grid>
              <Grid item xs={12}>
                 <TextField fullWidth id="role" label="Role" value={initialUser.role || ''} InputProps={{ readOnly: true }} variant="filled" margin="normal" />
              </Grid>
            </Grid>
            {error && isSubmitting && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ borderRadius: '12px', boxShadow: 3, mt: 3 }}>
        <CardHeader title="Change Password" />
        <CardContent>
          <Typography color="text.secondary">Password change functionality requires a separate form and API endpoint.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;