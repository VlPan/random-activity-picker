import {Box} from '@mui/material';

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`playlist-tabpanel-${index}`}
      aria-labelledby={`playlist-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
