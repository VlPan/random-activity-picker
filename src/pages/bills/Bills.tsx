import { useState } from 'react';
import { Box, Typography, Button, IconButton, Stack, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';

import { useBillContext } from '../../contexts/BillContext';
import { useUserContext } from '../../contexts/UserContext';
import { BillDialog } from '../../components/bills/BillDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { DataTable, type ColumnDef } from '../../components/common/DataTable';
import type { Bill } from '../../models/bill';

const Bills = () => {
  const { bills, addBill, updateBill, deleteBill } = useBillContext();
  const { balance, updateBalance, rewardSettings } = useUserContext();

  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [billToCover, setBillToCover] = useState<Bill | null>(null);
  const [coverCost, setCoverCost] = useState(0);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingBill(undefined);
    setBillDialogOpen(true);
  };

  const handleEditClick = (bill: Bill) => {
    setEditingBill(bill);
    setBillDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setBillToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (billToDelete) {
      deleteBill(billToDelete);
      setDeleteConfirmOpen(false);
      setBillToDelete(null);
    }
  };

  const handleSaveBill = (bill: Bill) => {
    if (editingBill) {
      updateBill(bill);
    } else {
      addBill(bill);
    }
  };

  const handleCoverClick = (bill: Bill) => {
    let cost = bill.cost;
    if (bill.isBasicNecessity) {
      const discount = rewardSettings.basicNecessityDiscount || 0;
      cost = cost * (1 - discount / 100);
    }
    setBillToCover(bill);
    setCoverCost(cost);
    setConfirmDialogOpen(true);
  };

  const handleConfirmCover = () => {
    if (billToCover) {
      updateBalance(-coverCost);
      updateBill({
        ...billToCover,
        lastCoveredDate: new Date().toISOString()
      });
      setConfirmDialogOpen(false);
      setBillToCover(null);
    }
  };

  const columns: ColumnDef<Bill>[] = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { 
      id: 'cost', 
      label: 'Cost (ZL)', 
      align: 'right',
      render: (bill) => bill.cost.toFixed(2)
    },
    {
      id: 'isBasicNecessity',
      label: 'Basic Necessity',
      align: 'center',
      render: (bill) => (
        <Checkbox checked={bill.isBasicNecessity} disabled size="small" />
      )
    },
    {
      id: 'lastCoveredDate',
      label: 'Last Covered',
      align: 'right',
      minWidth: 150,
      render: (bill) => {
        if (!bill.lastCoveredDate) return 'Never';
        const days = Math.floor((new Date().getTime() - new Date(bill.lastCoveredDate).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
      }
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (bill) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton 
            size="small" 
            color="success" 
            onClick={() => handleCoverClick(bill)}
            title="Cover Bill"
          >
            <AccountBalanceWalletIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleEditClick(bill)}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => handleDeleteClick(bill.id)}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Bills</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Bill
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          Current Balance: {balance.toFixed(2)} ZL
        </Typography>
      </Box>

      <DataTable 
        data={bills}
        columns={columns}
        minWidth={600}
      />

      <BillDialog
        open={billDialogOpen}
        onClose={() => setBillDialogOpen(false)}
        onSave={handleSaveBill}
        bill={editingBill}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Cover Bill"
        content={`Are you sure you want to cover "${billToCover?.name}" for ${coverCost.toFixed(2)} ZL? (Original: ${billToCover?.cost.toFixed(2)} ZL)`}
        onConfirm={handleConfirmCover}
        onClose={() => setConfirmDialogOpen(false)}
        confirmLabel="Cover"
        confirmColor="success"
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Bill"
        content="Are you sure you want to delete this bill?"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Bills;
