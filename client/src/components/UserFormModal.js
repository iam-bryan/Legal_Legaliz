import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Alert, CircularProgress, Box
} from '@mui/material';

const UserFormModal = ({ open, onClose, onSave, user }) => {
  // State for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Only used when creating new users
  const [role, setRole] = useState('client'); // Default role

  // State for loading and errors within the modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(user); // Check if we are editing an existing user

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setRole(user.role || 'client');
      setPassword(''); // Never show existing password hash
    } else {
      // Reset form when opening for "Add New"
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('client');
    }
    setError(''); // Clear errors when modal opens or user data changes
  }, [user, open]); // Re-run this effect if the 'user' prop changes or the modal 'open' state changes

  const handleSubmit = async () => {
    setError(''); // Clear previous errors
    // Basic validation
    if (!firstName || !email || (!isEditMode && !password) || !role) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isEditMode && password.length < 8) {
        setError("Password must be at least 8 characters long for new users.");
        return;
    }

    setLoading(true); // Show loading indicator
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      role: role,
    };
    // Only include password if creating a new user
    if (!isEditMode) {
      userData.password = password;
    }

    try {
      // The onSave prop should be an async function or return a promise
      await onSave(userData); // Call the save function passed from the parent page
      onClose(); // Close modal on successful save (handled by parent calling onClose)
    } catch (err) {
      // Display the error message from the API response within the modal
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user.`);
      console.error("Save User Error in Modal:", err.response || err);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        {/* Display error message inside the modal */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }}> {/* Use Box with component="form" */}
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField required fullWidth label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12}>
                <TextField required fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} margin="normal" />
            </Grid>
            {!isEditMode && ( // Only show password field when adding new user
                <Grid item xs={12}>
                <TextField required fullWidth label="Password" type="password" helperText="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} margin="normal" />
                </Grid>
            )}
            <Grid item xs={12}>
                <TextField select required fullWidth label="Role" value={role} onChange={e => setRole(e.target.value)} margin="normal">
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="partner">Partner</MenuItem>
                <MenuItem value="lawyer">Lawyer</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                </TextField>
            </Grid>
            </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create User')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;