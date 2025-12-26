import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4', // Standard M3 Purple
    },
    secondary: {
      main: '#625b71',
    },
  },
  shape: {
    borderRadius: 16, // Softer, rounder M3 corners
  },
});