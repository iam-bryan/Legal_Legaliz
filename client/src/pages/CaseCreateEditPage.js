import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Grid, MenuItem, Card, CardContent, Select, InputLabel, FormControl } from '@mui/material'; // Added Select, InputLabel, FormControl
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../api/apiService';

const CaseCreateEditPage = () => {
  const { id } = useParams(); // Get the case ID from the URL if editing (/cases/edit/:id)
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // True if an ID is present

  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [lawyerId, setLawyerId] = useState('');
  const [status, setStatus] = useState('open'); // Add status state, default to 'open'
  const [progress, setProgress] = useState(0); // Add progress state, default to 0

  // State for dropdown options
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  // State for loading and errors
  const [loading, setLoading] = useState(false); // For form submission
  const [pageLoading, setPageLoading] = useState(isEditMode); // For fetching data in edit mode
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch dropdown data and existing case data (if editing)
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    setError(''); // Clear errors on load/mode change

    // Fetch clients and lawyers for dropdowns
    const fetchDropdowns = async () => {
        try {
            const [clientsRes, lawyersRes] = await Promise.all([
                apiService.getClients(),
                apiService.getLawyers()
            ]);
            if (isMounted) {
                setClients(clientsRes.data.records || []);
                setLawyers(lawyersRes.data.records || []);
            }
        } catch (err) {
             if (isMounted) {
                setError("Could not load client or lawyer lists.");
                console.error("Fetch Dropdowns Error:", err.response || err);
             }
        }
    };

    // Fetch existing case data if in edit mode
    const fetchCaseData = async () => {
        if (isEditMode) {
            setPageLoading(true);
            try {
                const res = await apiService.getCaseDetails(id);
                const caseData = res.data;
                 if (isMounted) {
                    setTitle(caseData.title || '');
                    setDescription(caseData.description || '');
                    setClientId(caseData.client_id || '');
                    setLawyerId(caseData.lawyer_id || '');
                    setStatus(caseData.status || 'open');
                    setProgress(caseData.progress || 0);
                 }
            } catch (err) {
                 if (isMounted) {
                    setError('Failed to load case details for editing.');
                    console.error("Fetch Case Error:", err.response || err);
                 }
            } finally {
                 if (isMounted) setPageLoading(false);
            }
        }
    };

    fetchDropdowns();
    fetchCaseData();

    // Cleanup function to set isMounted to false when component unmounts
    return () => { isMounted = false; };

  }, [id, isEditMode]); // Rerun if ID changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!title || !clientId || !lawyerId) {
      setError("Please fill in Title, Client, and Lawyer.");
      setLoading(false);
      return;
    }
     const progressValue = parseInt(progress, 10);
     if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        setError("Progress must be a number between 0 and 100.");
        setLoading(false);
        return;
     }


    const caseData = {
      id: isEditMode ? id : undefined, // Include ID only if editing
      title,
      description,
      client_id: clientId,
      lawyer_id: lawyerId,
      status, // Include status
      progress: progressValue, // Include progress
    };

    try {
      const apiCall = isEditMode
        ? apiService.updateCase(caseData)
        : apiService.createCase(caseData);

      await apiCall;
      setSuccess(`Case successfully ${isEditMode ? 'updated' : 'created'}!`);
      setLoading(false);
      // Redirect back to case list or details page after a short delay
      setTimeout(() => navigate(isEditMode ? `/cases/${id}` : '/cases'), 1500);

    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} case.`;
      setError(errMsg);
      console.error("Save Case Error:", err.response || err);
    }
  };

  // Show loading spinner while fetching data for edit mode
  if (pageLoading && isEditMode) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        {isEditMode ? `Edit Case: ${title || ''}` : 'Create New Case'}
      </Typography>

      {/* Show general page load errors or success messages */}
      {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField required fullWidth id="title" label="Case Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} margin="normal"/>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth id="description" label="Case Description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} margin="normal"/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select required fullWidth id="client_id" label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={loading || clients.length === 0} margin="normal">
                  <MenuItem value=""><em>Select a Client</em></MenuItem>
                  {clients.map((client) => (<MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select required fullWidth id="lawyer_id" label="Assign Lawyer" value={lawyerId} onChange={(e) => setLawyerId(e.target.value)} disabled={loading || lawyers.length === 0} margin="normal">
                  <MenuItem value=""><em>Select a Lawyer</em></MenuItem>
                  {lawyers.map((lawyer) => (<MenuItem key={lawyer.id} value={lawyer.id}>{lawyer.name}</MenuItem>))}
                </TextField>
              </Grid>
              {/* Add Status and Progress fields */}
               <Grid item xs={12} sm={6}>
                 <FormControl fullWidth margin="normal">
                   <InputLabel id="status-select-label">Status</InputLabel>
                   <Select
                     labelId="status-select-label"
                     id="status"
                     value={status}
                     label="Status"
                     onChange={(e) => setStatus(e.target.value)}
                     disabled={loading}
                   >
                     <MenuItem value={'open'}>Open</MenuItem>
                     <MenuItem value={'in_progress'}>In Progress</MenuItem>
                     <MenuItem value={'closed'}>Closed</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   id="progress"
                   label="Progress (%)"
                   type="number"
                   InputProps={{ inputProps: { min: 0, max: 100 } }} // Basic validation
                   value={progress}
                   onChange={(e) => setProgress(e.target.value)}
                   disabled={loading}
                   margin="normal"
                 />
               </Grid>
            </Grid>

            {/* Display specific submission errors */}
            {error && loading && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create Case')}
              </Button>
              <Button variant="outlined" onClick={() => navigate(isEditMode ? `/cases/${id}` : '/cases')} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseCreateEditPage; // Ensure export name matches filename if renamed