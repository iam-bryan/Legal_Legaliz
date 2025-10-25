import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import apiService from '../api/apiService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserFormModal from '../components/UserFormModal'; // Import the modal

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for controlling the modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // User object for editing, or null for adding

  // Function to fetch users from the API
  const fetchUsers = () => {
    setLoading(true); // Show loading indicator during fetch
    setError(''); // Clear previous errors
    apiService.getUsers()
      .then(response => {
        setUsers(response.data.records || []);
      })
      .catch(err => {
        // Display error from API or a generic message
        setError(err.response?.data?.message || 'Failed to fetch users. You might not have permission.');
        console.error("Fetch Users Error:", err.response || err);
      })
      .finally(() => {
        setLoading(false); // Hide loading indicator
      });
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers for opening and closing the modal
  const handleOpenModal = (user = null) => {
    setCurrentUser(user); // Set the user to edit, or null if adding a new one
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUser(null); // Clear the current user when closing
  };

  // Function passed to the modal to handle saving (create or update)
  const handleSaveUser = (userData) => {
    // Return the promise from the API call so the modal can handle its own loading/error state
    return currentUser
      ? apiService.updateUser({ ...userData, id: currentUser.id }) // Add ID if updating
      : apiService.createUser(userData);
  };

  // Function to handle user deletion
  const handleDeleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setLoading(true); // Show loading state on the page
    setError('');
    apiService.deleteUser(id)
      .then(() => {
        fetchUsers(); // Refresh the user list after successful deletion
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to delete user.');
        console.error("Delete User Error:", err.response || err);
        setLoading(false); // Ensure loading stops on error
      });
  };

  // Define columns for the user data grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'First Name', flex: 1, minWidth: 130 },
    { field: 'last_name', headerName: 'Last Name', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 100 },
    {
        field: 'created_at',
        headerName: 'Created On',
        flex: 1,
        minWidth: 150,
        // Format the date for display
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      filterable: false,
      // Render Edit and Delete buttons for each row
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenModal(params.row)} color="primary" size="small" aria-label="edit user">
            <EditIcon fontSize="small"/>
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(params.row.id)} color="error" size="small" aria-label="delete user">
            <DeleteIcon fontSize="small"/>
          </IconButton>
        </Box>
      ),
    },
  ];

  // Show main loading indicator only on the initial load
  if (loading && users.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()} // Open modal in "Add New" mode
        >
          Add New User
        </Button>
      </Box>

      {/* Display general errors (like fetch errors) here */}
      {error && !modalOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* User Data Grid */}
      <Box sx={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 3 }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={loading} // Show loading overlay during data refresh
          getRowId={(row) => row.id} // Tell DataGrid how to get unique ID
        />
      </Box>

      {/* Add/Edit User Modal */}
      <UserFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={(userData) => handleSaveUser(userData).then(fetchUsers)} // Refresh list on successful save
        user={currentUser}
      />
    </Box>
  );
};

export default UserManagementPage;