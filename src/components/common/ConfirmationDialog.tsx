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
  content: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  content,
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
  disabled = false,
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
        <DialogContentText component="div" id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color={confirmColor} autoFocus disabled={disabled}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
