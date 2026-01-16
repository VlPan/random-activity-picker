import { useState, useMemo } from 'react';
import { Box, Typography, Button, IconButton, Stack, Checkbox, TextField } from '@mui/material';
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
  const [manualCost, setManualCost] = useState<string>('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('');

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedBills = useMemo(() => {
    if (!orderBy) return bills;

    return [...bills].sort((a, b) => {
      if (orderBy === 'cost') {
        const costA = a.cost;
        const costB = b.cost;
        
        // Unfixed (null) bills always at the top
        if (costA === null && costB === null) return 0;
        if (costA === null) return -1;
        if (costB === null) return 1;
        
        if (order === 'asc') {
          return costA - costB;
        } else {
          return costB - costA;
        }
      }
      return 0;
    });
  }, [bills, order, orderBy]);

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

  const calculateDiscountedCost = (cost: number, isBasicNecessity: boolean) => {
      if (isBasicNecessity) {
        const discount = rewardSettings.basicNecessityDiscount || 0;
        return cost * (1 - discount / 100);
      }
      return cost;
  }

  const handleCoverClick = (bill: Bill) => {
    setBillToCover(bill);
    if (bill.cost === null) {
        setManualCost('');
        setCoverCost(0);
    } else {
        setCoverCost(calculateDiscountedCost(bill.cost, bill.isBasicNecessity));
    }
    setConfirmDialogOpen(true);
  };

  const handleManualCostChange = (val: string) => {
    setManualCost(val);
    const cost = parseFloat(val);
    if (!isNaN(cost) && billToCover) {
      setCoverCost(calculateDiscountedCost(cost, billToCover.isBasicNecessity));
    } else {
       setCoverCost(0);
    }
  };

  const handleConfirmCover = () => {
    if (billToCover) {
      updateBalance(-coverCost, `Bill Payment: ${billToCover.name}`);
      updateBill({
        ...billToCover,
        lastCoveredDate: new Date().toISOString()
      });
      setConfirmDialogOpen(false);
      setBillToCover(null);
    }
  };

  const getConfirmationContent = () => {
    if (!billToCover) return '';
    
    if (billToCover.cost === null) {
      return (
        <Box>
            <Typography sx={{ mb: 2 }}>
                Enter the amount you are paying for "{billToCover.name}".
            </Typography>
            <TextField 
                label="Amount (ZL)" 
                type="number" 
                value={manualCost} 
                onChange={(e) => handleManualCostChange(e.target.value)}
                fullWidth
                autoFocus
                sx={{ mb: 2 }}
            />
            {manualCost && !isNaN(parseFloat(manualCost)) && (
                <Typography>
                    Are you sure you want to cover "{billToCover.name}" for {coverCost.toFixed(2)} ZL? (Original: {parseFloat(manualCost).toFixed(2)} ZL)
                </Typography>
            )}
        </Box>
      );
    }

    return `Are you sure you want to cover "${billToCover.name}" for ${coverCost.toFixed(2)} ZL? (Original: ${billToCover.cost.toFixed(2)} ZL)`;
  };

  const columns: ColumnDef<Bill>[] = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { 
      id: 'cost', 
      label: 'Cost (ZL)', 
      align: 'right',
      render: (bill) => bill.cost !== null ? bill.cost.toFixed(2) : 'Unfixed',
      sortable: true
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
        data={sortedBills}
        columns={columns}
        minWidth={600}
        order={order}
        orderBy={orderBy}
        onRequestSort={handleRequestSort}
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
        content={getConfirmationContent()}
        onConfirm={handleConfirmCover}
        onClose={() => setConfirmDialogOpen(false)}
        confirmLabel="Cover"
        confirmColor="success"
        disabled={billToCover?.cost === null && (manualCost === '' || isNaN(parseFloat(manualCost)))}
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
