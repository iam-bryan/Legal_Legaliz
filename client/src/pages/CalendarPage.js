import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem,
  Card // <-- IMPORT CARD HERE
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import apiService from '../api/apiService';
import AddIcon from '@mui/icons-material/Add';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const calendarRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  const [newEventCaseId, setNewEventCaseId] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [cases, setCases] = useState([]);

  useEffect(() => {
    apiService.getCases().then(res => setCases(res.data.records || [])).catch(console.error);
  }, []);

  const handleDatesSet = (dateInfo) => {
    setLoading(true);
    setError('');
    const startStr = dateInfo.startStr.split('T')[0];
    const endStr = dateInfo.endStr.split('T')[0];

    apiService.getSchedules(startStr, endStr)
      .then(response => {
        const formattedEvents = (response.data || []).map(event => ({
           id: event.id,
           title: event.title,
           start: event.start,
           end: event.end,
           extendedProps: event.extendedProps
        }));
        setEvents(formattedEvents);
      })
      .catch(err => {
        setError('Failed to fetch schedule events.');
        console.error("Fetch Schedule Error:", err.response || err);
      })
      .finally(() => setLoading(false));
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewEventTitle(clickInfo.event.title);
    setNewEventStart(clickInfo.event.startStr.slice(0, 16));
    setNewEventEnd(clickInfo.event.endStr ? clickInfo.event.endStr.slice(0, 16) : '');
    setNewEventCaseId(clickInfo.event.extendedProps?.case_id || '');
    setNewEventLocation(clickInfo.event.extendedProps?.location || '');
    setNewEventNotes(clickInfo.event.extendedProps?.notes || '');
    setModalOpen(true);
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedEvent(null);
    setNewEventTitle('');
    setNewEventStart(selectInfo.startStr.slice(0, 16));
    setNewEventEnd(selectInfo.endStr.slice(0, 16));
    setNewEventCaseId('');
    setNewEventLocation('');
    setNewEventNotes('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setError('');
  };

  const handleSaveEvent = () => {
    setError('');
    if (!newEventTitle || !newEventStart || !newEventCaseId) {
        setError("Please fill in Title, Start Time, and Related Case.");
        return;
    }

    const eventData = {
        id: selectedEvent?.id,
        event_title: newEventTitle,
        start_date: newEventStart,
        end_date: newEventEnd || null,
        case_id: newEventCaseId,
        location: newEventLocation,
        notes: newEventNotes,
        status: selectedEvent?.extendedProps?.status || 'pending'
    };

    const apiCall = selectedEvent
      ? apiService.updateScheduleEvent(eventData)
      : apiService.createScheduleEvent(eventData);

    apiCall.then(() => {
        setModalOpen(false);
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    }).catch(err => {
        const errMsg = err.response?.data?.message || (selectedEvent ? "Failed to update event." : "Failed to create event.");
        setError(errMsg);
        console.error("Save Event Error:", err.response || err);
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent || !window.confirm("Are you sure you want to delete this event?")) return;

    apiService.deleteScheduleEvent(selectedEvent.id)
    .then(() => {
        setModalOpen(false);
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    }).catch(err => {
        const errMsg = err.response?.data?.message || "Failed to delete event.";
        setError(errMsg);
        console.error("Delete Event Error:", err.response || err);
    });
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Calendar & Schedule
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleDateSelect({ startStr: new Date().toISOString(), endStr: new Date().toISOString() })}>
            Add Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress size={24} sx={{ mb: 2 }}/>}

      <Card sx={{ borderRadius: '12px', boxShadow: 3, p: 2 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          datesSet={handleDatesSet}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="70vh"
        />
      </Card>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                 <Grid item xs={12}>
                    <TextField required fullWidth label="Event Title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Start Time" type="datetime-local" InputLabelProps={{ shrink: true }} value={newEventStart} onChange={e => setNewEventStart(e.target.value)} />
                 </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="End Time" type="datetime-local" InputLabelProps={{ shrink: true }} value={newEventEnd} onChange={e => setNewEventEnd(e.target.value)} />
                 </Grid>
                 <Grid item xs={12}>
                     <TextField select required fullWidth label="Related Case" value={newEventCaseId} onChange={e => setNewEventCaseId(e.target.value)}>
                         <MenuItem value=""><em>Select a Case</em></MenuItem>
                         {cases.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                     </TextField>
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Location (Optional)" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} />
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Notes (Optional)" multiline rows={3} value={newEventNotes} onChange={e => setNewEventNotes(e.target.value)} />
                 </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
             {selectedEvent && (
                <Button onClick={handleDeleteEvent} color="error">Delete Event</Button>
             )}
             <Box>
                <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Cancel</Button>
                <Button onClick={handleSaveEvent} variant="contained">{selectedEvent ? 'Save Changes' : 'Create Event'}</Button>
             </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;