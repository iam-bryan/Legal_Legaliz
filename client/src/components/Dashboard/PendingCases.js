import React from 'react';
import { Card, CardHeader, List, ListItem, ListItemText, LinearProgress, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

// This component displays the list of cases with their progress bars
const PendingCases = ({ cases = [] }) => {
  // Show the 5 most recent cases that are not closed
  const pending = cases.filter(c => c.status !== 'closed').slice(0, 5);

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
      <CardHeader title="Pending Cases" />
      <List>
        {pending.length > 0 ? pending.map(caseItem => (
          <ListItem
            key={caseItem.id}
            component={Link}
            to={`/cases/${caseItem.id}`} // We'll create this route later
            sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemText
              primary={caseItem.title}
              secondary={`Client: ${caseItem.client_name}`}
            />
            <Box sx={{ width: '30%', ml: 2 }}>
              <LinearProgress variant="determinate" value={caseItem.progress || 0} sx={{ height: 8, borderRadius: 5 }} />
              <Typography variant="caption" color="text.secondary">{`${caseItem.progress || 0}%`}</Typography>
            </Box>
          </ListItem>
        )) : <ListItem><ListItemText primary="No pending cases found." /></ListItem>}
      </List>
    </Card>
  );
};

export default PendingCases;