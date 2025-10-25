import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Button, Card, CardContent, Grid, Divider,
    List, ListItem, ListItemText, Chip // <-- IMPORT Chip HERE
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ClientDetailsPage = () => {
  const { id } = useParams(); // Get client ID from URL
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [associatedCases, setAssociatedCases] = useState([]); // State for cases
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch all data for the page
  const fetchData = useCallback(() => {
      setLoading(true);
      setError('');
      Promise.all([
          apiService.getClientDetails(id),
          apiService.getCases() // Fetch all cases to filter
      ])
      .then(([clientResponse, casesResponse]) => {
          setClient(clientResponse.data);
          // Filter cases client-side
          const clientCases = (casesResponse.data.records || []).filter(
              // Use == for potential type difference (string from URL vs number from API)
              c => c.client_id == id
          );
          setAssociatedCases(clientCases);
      })
      .catch(err => {
          setError('Failed to fetch client details or associated cases.');
          console.error("Fetch Client Data Error:", err.response || err);
      })
      .finally(() => setLoading(false));
  }, [id]); // Dependency: refetch if ID changes

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Use the memoized fetchData function

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this client? This will remove their profile but may not delete associated cases depending on database constraints.")) return;
      setLoading(true); // Indicate activity
      setError('');
      try {
          await apiService.deleteClient(id);
          navigate('/clients'); // Redirect after successful deletion
      } catch(err) {
          setError(err.response?.data?.message || "Failed to delete client.");
          setLoading(false); // Stop loading on error
          console.error("Delete Client Error:", err.response || err);
      }
      // No finally setLoading(false) here because we navigate away on success
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!client) {
    return <Alert severity="warning">Client not found.</Alert>;
  }

  // Function to get chip color based on case status
  const getStatusChipColor = (status) => {
    switch (status) { case 'open': return 'success'; case 'in_progress': return 'warning'; case 'closed': return 'error'; default: return 'default'; }
  };


  return (
    <Box>
      {/* Header with Edit/Delete buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {client.name}
        </Typography>
        <Box>
           <Button
             variant="contained"
             startIcon={<EditIcon />}
             onClick={() => navigate(`/clients/edit/${id}`)} // Navigate to the edit page
             sx={{ mr: 1 }}
           >
             Edit Client
           </Button>
           <Button
             variant="outlined"
             color="error"
             startIcon={<DeleteIcon />}
             onClick={handleDelete}
             disabled={loading} // Disable delete while another action is loading
           >
             Delete Client
           </Button>
        </Box>
      </Box>

      {/* Main Details Card */}
      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Contact Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Email:</Typography>
              <Typography>{client.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Phone:</Typography>
              <Typography>{client.contact || 'N/A'}</Typography>
            </Grid>
             <Grid item xs={12}>
              <Typography color="text.secondary">Address:</Typography>
              <Typography>{client.address || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="text.secondary">Client Since:</Typography>
              <Typography>{new Date(client.created_at).toLocaleDateString()}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }}/>

          {/* Associated Cases List */}
          <Typography variant="h6" gutterBottom>Associated Cases</Typography>
          <List dense>
            {associatedCases.length > 0 ? associatedCases.map(c => (
                <ListItem
                    key={c.id}
                    button
                    onClick={() => navigate(`/cases/${c.id}`)} // Link to case details
                    divider
                    secondaryAction={ // Show status chip on the right
                        <Chip label={c.status} color={getStatusChipColor(c.status)} size="small"/>
                    }
                >
                    <ListItemText
                        primary={c.title}
                        secondary={`Attorney: ${c.lawyer_name || 'Unassigned'}`}
                    />
                </ListItem>
            )) : (
                <ListItem>
                    <ListItemText primary="No cases associated with this client." />
                </ListItem>
            )}
          </List>

        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientDetailsPage;