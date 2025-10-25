import React, { useState, useEffect } from 'react';
import {
    Grid, Box, Typography, CircularProgress, Alert, Card, CardHeader, CardContent,
    List, ListItem, ListItemText, Divider // Ensure imports are correct
} from '@mui/material';
import StatCard from '../components/Dashboard/StatCard';
import PendingCases from '../components/Dashboard/PendingCases';
import CaseDistributionChart from '../components/Dashboard/CaseDistributionChart';
import WorkloadChart from '../components/Dashboard/WorkloadChart';
import RecentActivity from '../components/Dashboard/RecentActivity'; // <-- Import Recent Activity
import apiService from '../api/apiService';
import authService from '../api/authService';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

const DashboardPage = () => {
  const [stats, setStats] = useState({ total: 0, open: 0, clients: 0 });
  const [cases, setCases] = useState([]);
  const [workloadData, setWorkloadData] = useState({ labels: [], data: [] });
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]); // <-- State for activity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    setLoading(true); setError('');
    Promise.all([
      apiService.getCases(),
      apiService.getWorkloadData(),
      apiService.getClients(),
      apiService.getSchedules(new Date().toISOString().split('T')[0], new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      apiService.getRecentActivity(15) // <-- Fetch recent activity
    ])
    .then(([casesRes, workloadRes, clientsRes, schedulesRes, activityRes]) => { // <-- Add activityRes
      const allCases = casesRes.data.records || []; const openCases = allCases.filter(c => c.status !== 'closed'); setCases(allCases);
      const allClients = clientsRes.data.records || []; setStats({ total: allCases.length, open: openCases.length, clients: allClients.length });
      setWorkloadData(workloadRes.data || { labels: [], data: [] });
      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : (schedulesRes.data?.records || []); setUpcomingSchedules(schedulesData);
      setRecentActivity(activityRes.data.records || []); // <-- Set activity state
      setLoading(false);
    })
    .catch(err => { setError('Failed to fetch dashboard data.'); setLoading(false); console.error(err); });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Good Morning, {user?.name || 'User'}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>You have {stats.open} active cases.</Typography>
      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}> <StatCard title="Total Cases" value={stats.total} icon={<GavelIcon />} color="#2065D1" /> </Grid>
        <Grid item xs={12} sm={6} md={3}> <StatCard title="Active Cases" value={stats.open} icon={<CheckCircleOutlineIcon />} color="#388E3C" /> </Grid>
        <Grid item xs={12} sm={6} md={3}> <StatCard title="Total Clients" value={stats.clients} icon={<PeopleOutlineIcon />} color="#ED6C02" /> </Grid>
        <Grid item xs={12} sm={6} md={3}> <StatCard title="Upcoming (7d)" value={upcomingSchedules.length} icon={<AssignmentLateIcon />} color="#D32F2F" /> </Grid>
        {/* Middle Row */}
        <Grid item xs={12} lg={7}> <PendingCases cases={cases} /> </Grid>
        <Grid item xs={12} lg={5}> <CaseDistributionChart cases={cases} /> </Grid>
        {/* Bottom Row */}
        <Grid item xs={12} md={7}> <WorkloadChart workloadData={workloadData} /> </Grid>
        <Grid item xs={12} md={5}> <RecentActivity activities={recentActivity} loading={loading}/> </Grid> {/* <-- Display Recent Activity */}
      </Grid>
    </Box>
  );
};
export default DashboardPage;