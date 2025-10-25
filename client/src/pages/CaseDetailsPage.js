import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Button, Card, CardContent, Grid, Tabs, Tab,
    List, ListItem, ListItemText, IconButton, Divider, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // <-- Import PDF Icon
import DocumentUploadModal from '../components/Modals/DocumentUploadModal';
import ScheduleEventModal from '../components/Modals/ScheduleEventModal';
import BillingFormModal from '../components/Modals/BillingFormModal';

// --- Tab Content Components ---

const CaseSummary = ({ caseDetails }) => (
  <CardContent>
    <Typography variant="h6" gutterBottom>Case Details</Typography>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={6}><Typography color="text.secondary">Client:</Typography><Typography>{caseDetails.client_name}</Typography></Grid>
      <Grid item xs={12} sm={6}><Typography color="text.secondary">Assigned Attorney:</Typography><Typography>{caseDetails.lawyer_name}</Typography></Grid>
      <Grid item xs={12} sm={6}><Typography color="text.secondary">Status:</Typography><Chip label={caseDetails.status} color={caseDetails.status === 'open' ? 'success' : caseDetails.status === 'closed' ? 'error' : 'warning'} size="small" /></Grid>
      <Grid item xs={12} sm={6}><Typography color="text.secondary">Filing Date:</Typography><Typography>{new Date(caseDetails.created_at).toLocaleDateString()}</Typography></Grid>
    </Grid>
    <Divider sx={{ my: 2 }} />
    <Typography variant="h6" gutterBottom>Description</Typography>
    <Typography paragraph>{caseDetails.description || "No description provided."}</Typography>
  </CardContent>
);

const CaseDocuments = ({ caseId }) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchDocs = useCallback(() => { setLoading(true); setError(''); apiService.getDocumentsForCase(caseId).then(res => setDocs(res.data.records || [])).catch(err => setError("Failed docs load.")).finally(() => setLoading(false)); }, [caseId]);
    useEffect(() => { fetchDocs(); }, [fetchDocs]);
    const handleDelete = (docId) => { if (!window.confirm("Delete doc?")) return; setLoading(true); apiService.deleteDocument(docId).then(() => fetchDocs()).catch(err => setError("Failed delete.")).finally(() => setLoading(false)); };
    const handleUploadSuccess = () => { fetchDocs(); };
    if (loading && docs.length === 0) return <CardContent><CircularProgress size={24} /></CardContent>;
    return ( <> <CardContent> {error && <Alert severity="error">{error}</Alert>} <Button variant="contained" size="small" startIcon={<UploadFileIcon />} sx={{ mb: 2 }} onClick={() => setIsModalOpen(true)}> Upload </Button> {loading && <CircularProgress size={20} sx={{ml:1}}/>} <List dense> {docs.length > 0 ? docs.map(doc => (<ListItem key={doc.id} secondaryAction={<><Button size="small" variant="outlined" href={doc.file_path} target="_blank" sx={{ mr: 1 }}>View</Button><IconButton edge="end" onClick={() => handleDelete(doc.id)}><DeleteIcon color="error" fontSize="small"/></IconButton></>}> <ListItemText primary={doc.title} secondary={`Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}`}/></ListItem>)) : <ListItem><ListItemText primary="No docs."/></ListItem>} </List> </CardContent> <DocumentUploadModal open={isModalOpen} onClose={() => setIsModalOpen(false)} caseId={caseId} onUploadSuccess={handleUploadSuccess} /> </> );
};

const CaseSchedule = ({ caseId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEventInfo, setSelectedEventInfo] = useState(null);
    const fetchEvents = useCallback(() => { setLoading(true); setError(''); apiService.getSchedulesForCase(caseId).then(res => setEvents(res.data.records || [])).catch(err => setError("Failed schedule load.")).finally(() => setLoading(false)); }, [caseId]);
    useEffect(() => { fetchEvents(); }, [fetchEvents]);
    const handleOpenModal = (event = null) => { const eventInfo = event ? {id: event.id, title: event.title, startStr: event.start, endStr: event.end, extendedProps: {location: event.location, notes: event.notes, status: event.status}} : null; setSelectedEventInfo(eventInfo); setIsModalOpen(true); };
    const handleSaveSuccess = () => { fetchEvents(); };
    if (loading && events.length === 0) return <CardContent><CircularProgress size={24} /></CardContent>;
    return ( <> <CardContent> {error && <Alert severity="error">{error}</Alert>} <Button variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} sx={{mb: 2}} onClick={() => handleOpenModal()}> Add Event </Button> {loading && <CircularProgress size={20} sx={{ml: 1}}/>} <List dense> {events.length > 0 ? events.map(event => (<ListItem button key={event.id} onClick={() => handleOpenModal(event)}> <ListItemText primary={event.title} secondary={`Date: ${new Date(event.start).toLocaleString()} | Status: ${event.status}`}/> </ListItem>)) : <ListItem><ListItemText primary="No events."/></ListItem>} </List> </CardContent> <ScheduleEventModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSaveSuccess={handleSaveSuccess} eventInfo={selectedEventInfo} caseId={caseId} /> </> );
};

// --- UPDATED CaseBilling Component ---
const CaseBilling = ({ caseId }) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // Added for edit modal

     const fetchBilling = useCallback(() => { setLoading(true); setError(''); apiService.getBillingForCase(caseId).then(res => setBills(res.data.records || [])).catch(err => setError("Failed billing load.")).finally(() => setLoading(false)); }, [caseId]);
     useEffect(() => { fetchBilling(); }, [fetchBilling]);
     const handleSaveSuccess = () => { fetchBilling(); };
     const getStatusChipColor = (status) => { switch (status) { case 'paid': return 'success'; case 'unpaid': return 'warning'; case 'overdue': return 'error'; default: return 'default'; } };
     const handleOpenEditModal = (record) => { setSelectedRecord(record); setNewStatus(record.status); setUpdateError(''); setIsEditModalOpen(true); };
     const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedRecord(null); setIsUpdatingStatus(false);};
     const handleUpdateStatus = () => { if (!selectedRecord || !newStatus) return; setUpdateError(''); setIsUpdatingStatus(true); apiService.updateBillingStatus(selectedRecord.id, newStatus).then(() => { handleCloseEditModal(); fetchBilling(); }).catch(err => { setUpdateError(err.response?.data?.message || "Update failed."); }).finally(() => { setIsUpdatingStatus(false); }); };

     // --- Base URL for API ---
     const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

     if (loading && bills.length === 0) return <CardContent><CircularProgress size={24} /></CardContent>;

    return (
        <>
            <CardContent>
                {error && <Alert severity="error">{error}</Alert>}
                <Button variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} sx={{mb: 2}} onClick={() => setIsAddModalOpen(true)}> Add Billing </Button>
                {loading && <CircularProgress size={20} sx={{ml: 1}}/>}
                <List dense>
                    {bills.length > 0 ? bills.map(bill => (
                        <ListItem key={bill.id} divider
                            secondaryAction={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography sx={{ fontWeight: 'medium', minWidth: '80px', textAlign: 'right' }}>
                                        ₱{Number(bill.amount).toFixed(2)}
                                    </Typography>
                                    <Chip label={bill.status} color={getStatusChipColor(bill.status)} size="small" sx={{ mx: 1.5 }}/>
                                    {/* --- ADDED INVOICE BUTTON --- */}
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        href={`${API_BASE_URL}/billing/invoice_pdf.php?invoice_number=${bill.invoice_number}`}
                                        target="_blank"
                                        aria-label="view invoice pdf"
                                        sx={{ mr: 1 }}
                                        title="View Invoice PDF"
                                    >
                                        <PictureAsPdfIcon fontSize="small"/>
                                    </IconButton>
                                    {/* --- END INVOICE BUTTON --- */}
                                    <IconButton edge="end" size="small" onClick={() => handleOpenEditModal(bill)} aria-label="edit status">
                                        <EditIcon fontSize="small"/>
                                    </IconButton>
                                </Box>
                            }>
                            <ListItemText
                                primary={bill.description}
                                secondary={`Inv #: ${bill.invoice_number} | Due: ${bill.due_date || 'N/A'}`}
                            />
                        </ListItem>
                    )) : <ListItem><ListItemText primary="No records."/></ListItem>}
                </List>
            </CardContent>
            {/* Modals */}
            <BillingFormModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSaveSuccess={handleSaveSuccess} caseId={caseId} />
            <Dialog open={isEditModalOpen} onClose={handleCloseEditModal}>
                <DialogTitle>Update Status</DialogTitle>
                <DialogContent>
                    {updateError && <Alert severity="error">{updateError}</Alert>}
                    <Typography sx={{mb: 2}}>Inv: {selectedRecord?.invoice_number}</Typography>
                    <FormControl fullWidth sx={{mt: 1}}>
                        <InputLabel id="status-update-label-case-detail">Status</InputLabel>
                        <Select labelId="status-update-label-case-detail" value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)} disabled={isUpdatingStatus}>
                            <MenuItem value={'unpaid'}>Unpaid</MenuItem> <MenuItem value={'paid'}>Paid</MenuItem> <MenuItem value={'overdue'}>Overdue</MenuItem> <MenuItem value={'pending'}>Pending</MenuItem> <MenuItem value={'canceled'}>Canceled</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditModal} disabled={isUpdatingStatus}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} variant="contained" disabled={isUpdatingStatus}> {isUpdatingStatus ? <CircularProgress size={24}/> : 'Update'} </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


// --- MAIN PAGE COMPONENT ---
const CaseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseDetails, setCaseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => { setLoading(true); setError(''); apiService.getCaseDetails(id).then(r => {setCaseDetails(r.data); setLoading(false);}).catch(e => {setError('Failed fetch'); setLoading(false);}); }, [id]);
    const handleTabChange = (e, v) => setTabValue(v);
    const handleEditClick = () => navigate(`/cases/edit/${id}`);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!caseDetails) return <Alert severity="warning">Not found.</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box><Typography variant="h4" sx={{ fontWeight: 'bold' }}>{caseDetails.title}</Typography><Typography variant="subtitle1" color="text.secondary">Case #{caseDetails.id}</Typography></Box>
                <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditClick}>Edit Case</Button>
            </Box>
            <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="case detail tabs">
                        <Tab label="Summary" id="tab-0" /> <Tab label="Documents" id="tab-1" /> <Tab label="Schedule" id="tab-2" /> <Tab label="Billing" id="tab-3" />
                    </Tabs>
                </Box>
                <Box hidden={tabValue !== 0}> {tabValue === 0 && <CaseSummary caseDetails={caseDetails} />} </Box>
                <Box hidden={tabValue !== 1}> {tabValue === 1 && <CaseDocuments caseId={id} />} </Box>
                <Box hidden={tabValue !== 2}> {tabValue === 2 && <CaseSchedule caseId={id} />} </Box>
                <Box hidden={tabValue !== 3}> {tabValue === 3 && <CaseBilling caseId={id} />} </Box>
            </Card>
        </Box>
    );
};

export default CaseDetailsPage;