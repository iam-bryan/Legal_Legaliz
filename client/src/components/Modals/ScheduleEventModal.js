import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Alert, CircularProgress, Box
} from '@mui/material';
import apiService from '../../api/apiService'; // Adjust path if needed

const ScheduleEventModal = ({ open, onClose, onSaveSuccess, eventInfo, caseId }) => {
  // eventInfo: Contains { id?, title?, start?, end?, extendedProps?, allDay? } from FullCalendar or null
  // caseId: The ID of the case we are currently viewing

  // State for form fields
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending'); // Default status

  // State for loading and errors within the modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(eventInfo?.id); // Check if we are editing an existing event

  // Pre-fill form based on eventInfo or date selection
  useEffect(() => {
    if (open) {
      if (eventInfo) { // Editing existing or opened from clicking event
        setTitle(eventInfo.title || '');
        // Format dates for datetime-local input: YYYY-MM-DDTHH:mm
        setStart(eventInfo.startStr ? eventInfo.startStr.slice(0, 16) : '');
        setEnd(eventInfo.endStr ? eventInfo.endStr.slice(0, 16) : '');
        setLocation(eventInfo.extendedProps?.location || '');
        setNotes(eventInfo.extendedProps?.notes || '');
        setStatus(eventInfo.extendedProps?.status || 'pending');
      } else {
        // Adding new event (e.g., from Add button, prefill start if possible)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const defaultStart = `${year}-${month}-${day}T${hours}:${minutes}`;

        setTitle('');
        setStart(defaultStart); // Default to now
        setEnd('');
        setLocation('');
        setNotes('');
        setStatus('pending');
      }
      setError(''); // Clear errors when modal opens
    }
  }, [eventInfo, open]); // Re-run when eventInfo or open state changes


  const handleSubmit = async () => {
    setError('');
    if (!title || !start || !caseId) {
      setError("Event Title, Start Time, and Case association are required.");
      return;
    }

    setLoading(true);
    const eventData = {
      id: eventInfo?.id, // Include ID only if editing
      event_title: title,
      start_date: start,
      end_date: end || null, // API should handle null end dates
      case_id: caseId, // Use the caseId passed as a prop
      location: location,
      notes: notes,
      status: status,
    };

    try {
      const apiCall = isEditMode
        ? apiService.updateScheduleEvent(eventData)
        : apiService.createScheduleEvent(eventData);

      await apiCall;
      onSaveSuccess(); // Call the success callback passed from parent
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event.`);
      console.error("Save Event Error in Modal:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!eventInfo?.id || !window.confirm("Are you sure you want to delete this event?")) return;
      setLoading(true);
      setError('');
      try {
          await apiService.deleteScheduleEvent(eventInfo.id);
          onSaveSuccess(); // Refresh list in parent
          onClose(); // Close modal
      } catch (err) {
          setError(err.response?.data?.message || "Failed to delete event.");
          console.error("Delete Event Error:", err.response || err);
      } finally {
          setLoading(false);
      }
  };


  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth> {/* Prevent closing while loading */}
      <DialogTitle>{isEditMode ? 'Edit Schedule Event' : 'Add New Schedule Event'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                 <Grid item xs={12}>
                    <TextField required fullWidth label="Event Title" value={title} onChange={e => setTitle(e.target.value)} margin="normal" disabled={loading}/>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Start Time" type="datetime-local" InputLabelProps={{ shrink: true }} value={start} onChange={e => setStart(e.target.value)} margin="normal" disabled={loading}/>
                 </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="End Time" type="datetime-local" InputLabelProps={{ shrink: true }} value={end} onChange={e => setEnd(e.target.value)} margin="normal" disabled={loading}/>
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Location (Optional)" value={location} onChange={e => setLocation(e.target.value)} margin="normal" disabled={loading}/>
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Notes (Optional)" multiline rows={3} value={notes} onChange={e => setNotes(e.target.value)} margin="normal" disabled={loading}/>
                 </Grid>
                 {/* Status Field (Optional, could be hidden if always 'pending' on create) */}
                 <Grid item xs={12}>
                     <TextField select fullWidth label="Status" value={status} onChange={e => setStatus(e.target.value)} margin="normal" disabled={loading}>
                         <MenuItem value="pending">Pending</MenuItem>
                         <MenuItem value="done">Done</MenuItem>
                         <MenuItem value="cancelled">Cancelled</MenuItem>
                         <MenuItem value="overdue">Overdue</MenuItem> {/* Consider setting overdue status automatically based on date */}
                     </TextField>
                 </Grid>
            </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            {isEditMode ? ( // Show delete only when editing
                <Button onClick={handleDelete} color="error" disabled={loading}>Delete Event</Button>
             ) : ( <Box /> /* Placeholder to keep alignment */ )}
             <Box>
                <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Save Changes' : 'Create Event')}
                </Button>
             </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleEventModal;