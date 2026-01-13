import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  content,
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color={confirmColor} autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
