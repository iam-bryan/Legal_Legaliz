import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

// This component is for the summary cards at the top of the dashboard
const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '12px', boxShadow: 3 }}>
      <Box sx={{
          backgroundColor: color || 'primary.main',
          color: 'white',
          borderRadius: '50%',
          p: 2,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary" sx={{ fontWeight: 'medium' }}>{title}</Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatCard;