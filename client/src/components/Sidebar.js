import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PsychologyIcon from '@mui/icons-material/Psychology'; // <-- New Icon for AI
import authService from '../api/authService';

const Sidebar = ({ handleDrawerToggle, mobileOpen: isMobileOpen, drawerWidth }) => {
  const user = authService.getCurrentUser();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['admin', 'partner', 'lawyer', 'staff', 'client'] },
    { text: 'Cases', path: '/cases', icon: <GavelIcon />, roles: ['admin', 'partner', 'lawyer', 'staff', 'client'] },
    { text: 'Clients', path: '/clients', icon: <PeopleIcon />, roles: ['admin', 'partner', 'lawyer', 'staff'] },
    { text: 'Documents', path: '/documents', icon: <FolderIcon />, roles: ['admin', 'partner', 'lawyer', 'staff', 'client'] },
    { text: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon />, roles: ['admin', 'partner', 'lawyer', 'staff', 'client'] },
    { text: 'Billing', path: '/billing', icon: <ReceiptIcon />, roles: ['admin', 'partner', 'lawyer', 'staff'] },
    // --- New AI Link (Available to non-clients) ---
    { text: 'AI Lookup', path: '/ai-lookup', icon: <PsychologyIcon />, roles: ['admin', 'partner', 'lawyer', 'staff'] },
    // --- Admin Link ---
    { text: 'User Management', path: '/admin/users', icon: <AdminPanelSettingsIcon />, roles: ['admin', 'partner'] },
  ];
  
  const drawerContent = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', my: 2 }}>
         <Typography variant="h6" noWrap component="div">
           Legal Case Mgmt
         </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.filter(item => user?.role && item.roles.includes(user.role)).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={item.path} sx={{ minHeight: 48, justifyContent: 'initial', px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: 1 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="main navigation">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary" open={isMobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;