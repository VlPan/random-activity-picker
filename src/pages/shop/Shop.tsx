import { useState } from 'react';
import { Box, Typography, Button, IconButton, Stack, Checkbox, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RepeatIcon from '@mui/icons-material/Repeat';

import { useShopContext } from '../../contexts/ShopContext';
import { useUserContext } from '../../contexts/UserContext';
import { ShopItemDialog } from '../../components/shop/ShopItemDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { DataTable, type ColumnDef } from '../../components/common/DataTable';
import type { ShopItem } from '../../models/shopItem';

const Shop = () => {
  const { items, addItem, updateItem, deleteItem } = useShopContext();
  const { balance, updateBalance, rewardSettings } = useUserContext();

  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | undefined>(undefined);

  const [confirmBuyOpen, setConfirmBuyOpen] = useState(false);
  const [itemToBuy, setItemToBuy] = useState<ShopItem | null>(null);
  const [buyCost, setBuyCost] = useState(0);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingItem(undefined);
    setShopDialogOpen(true);
  };

  const handleEditClick = (item: ShopItem) => {
    setEditingItem(item);
    setShopDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveItem = (item: ShopItem) => {
    if (editingItem) {
      updateItem(item);
    } else {
      addItem(item);
    }
  };

  const handleBuyClick = (item: ShopItem) => {
    let cost = item.cost;
    if (item.isBasicNecessity) {
      const discount = rewardSettings.basicNecessityDiscount || 0;
      cost = cost * (1 - discount / 100);
    }
    setBuyCost(cost);
    setItemToBuy(item);
    setConfirmBuyOpen(true);
  };

  const handleConfirmBuy = () => {
    if (itemToBuy) {
      if (balance >= buyCost) {
        updateBalance(-buyCost, `Shop Purchase: ${itemToBuy.name}`);
        if (!itemToBuy.isPersistent) {
          deleteItem(itemToBuy.id);
        }
        setConfirmBuyOpen(false);
        setItemToBuy(null);
      } else {
        alert("Insufficient funds!"); // Or a better UI notification
      }
    }
  };

  const columns: ColumnDef<ShopItem>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>{item.name}</Typography>
          {item.isPersistent && (
            <Tooltip title="Persistent Item">
              <RepeatIcon fontSize="small" color="action" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      id: 'cost',
      label: 'Cost',
      render: (item) => `${item.cost.toFixed(2)} ZL`,
    },
    {
      id: 'isBasicNecessity',
      label: 'Basic Necessity',
      render: (item) => (
        <Checkbox checked={item.isBasicNecessity} disabled />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (item) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton
            onClick={() => handleBuyClick(item)}
            color="primary"
            title="Buy"
          >
            <ShoppingCartIcon />
          </IconButton>
          <IconButton
            onClick={() => handleEditClick(item)}
            size="small"
            title="Edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(item.id)}
            size="small"
            color="error"
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Shop</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            Balance: {balance.toFixed(2)} ZL
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="No items in the shop"
      />

      <ShopItemDialog
        open={shopDialogOpen}
        onClose={() => setShopDialogOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
      />

      <ConfirmationDialog
        open={confirmBuyOpen}
        title="Confirm Purchase"
        content={`Are you sure you want to buy "${itemToBuy?.name}" for ${buyCost.toFixed(2)} ZL?`}
        onConfirm={handleConfirmBuy}
        onClose={() => setConfirmBuyOpen(false)}
        confirmLabel="Buy"
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Item"
        content="Are you sure you want to delete this item?"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Shop;
