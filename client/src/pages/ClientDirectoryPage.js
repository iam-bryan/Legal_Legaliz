import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService'; // Assuming you have apiService.js
import AddIcon from '@mui/icons-material/Add';

const ClientDirectoryPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiService.getClients() // Make sure getClients exists in your apiService
      .then(response => {
        setClients(response.data.records || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch clients.');
        console.error("Fetch Clients Error:", err.response || err);
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: 'name', headerName: 'Client Name', flex: 1.5, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'contact', headerName: 'Phone', flex: 1, minWidth: 150 },
    { field: 'address', headerName: 'Address', flex: 2, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/clients/${params.row.id}`)} // Route for client details (placeholder)
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Client Directory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')} // Route for adding a new client (placeholder)
        >
          Add New Client
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 3 }}>
        <DataGrid
          rows={clients}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id} // Ensure DataGrid knows how to get the unique ID for each row
        />
      </Box>
    </Box>
  );
};

export default ClientDirectoryPage;