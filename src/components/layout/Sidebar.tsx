import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  styled,
  Drawer as MuiDrawer,
  Divider,
} from '@mui/material';
import type { CSSObject, Theme } from '@mui/material';
import {
  Shuffle as ShuffleIcon,
  Inventory as InventoryIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { useLayoutContext } from '../../contexts/LayoutContext';
import { useUserContext } from '../../contexts/UserContext';
import { useTodoContext } from '../../contexts/TodoContext';
import { Box, Tooltip } from '@mui/material';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        display: 'flex',
        flexDirection: 'column',
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        display: 'flex',
        flexDirection: 'column',
      },
    }),
  }),
);

const Sidebar = () => {
  const { isSidebarOpen: open, toggleSidebar: handleDrawerToggle } = useLayoutContext();
  const { points, luckyNumber } = useUserContext();
  const { activeTaskId, activeTaskTime, isPaused, pauseTimer, resumeTimer, getFormattedTime } = useTodoContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTimerClick = () => {
    if (isPaused) resumeTimer();
    else pauseTimer();
  };

  const menuItems = [
    { text: 'Randomizer', icon: <ShuffleIcon />, path: '/randomizer' },
    { text: 'Projects', icon: <AccountTreeIcon />, path: '/projects' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Statistics', icon: <BarChartIcon />, path: '/statistics' },
    { text: 'Bills', icon: <ReceiptIcon />, path: '/bills' },
    { text: 'Shop', icon: <ShoppingCartIcon />, path: '/shop' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 0 }}>
        {activeTaskId && (
          <>
            <Divider />
            <Tooltip title={isPaused ? "Resume" : "Pause"} placement="right" disableHoverListener={open}>
                <Box
                    onClick={handleTimerClick}
                    sx={{
                    minHeight: 48,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 2.5,
                    color: isPaused ? 'warning.main' : 'success.main',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: open ? 'inherit' : '0.75rem',
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                    }}
                >
                    {getFormattedTime(activeTaskTime)}
                </Box>
            </Tooltip>
          </>
        )}
        <Divider />
        <Tooltip title={`Lucky Number: ${luckyNumber}`} placement="right" disableHoverListener={open}>
            <Box
                sx={{
                minHeight: 48,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2.5,
                color: 'secondary.main',
                fontWeight: 'bold'
                }}
            >
                {luckyNumber}
            </Box>
        </Tooltip>
        <Divider />
        <Tooltip title={`Points: ${points}P`} placement="right" disableHoverListener={open}>
            <Box
                sx={{
                minHeight: 48,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2.5,
                color: 'primary.main',
                fontWeight: 'bold'
                }}
            >
                {points}P
            </Box>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
