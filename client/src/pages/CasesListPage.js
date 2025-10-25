import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import AddIcon from '@mui/icons-material/Add';

const CasesListPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCases = () => {
    setLoading(true);
    apiService.getCases()
      .then(response => {
        setCases(response.data.records || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch cases. Please try again.');
        console.error("Fetch Cases Error:", err.response || err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'title', headerName: 'Case Title', flex: 2, minWidth: 250 },
    { field: 'client_name', headerName: 'Client', flex: 1, minWidth: 150 },
    { field: 'lawyer_name', headerName: 'Assigned Attorney', flex: 1, minWidth: 150 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusChipColor(params.value)} size="small" />
      )
    },
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
          onClick={() => navigate(`/cases/${params.row.id}`)}
        >
          Details
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
          Case Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/cases/new')}
        >
          Add New Case
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 3 }}>
        <DataGrid
          rows={cases}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default CasesListPage;