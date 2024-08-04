'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Select, MenuItem, Checkbox, InputLabel, FormControl, ListItemText, Grid } from '@mui/material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [categories, setCategories] = useState(["Fresh Produce", "Dairy", "Non-Food", "Dry Goods"])
  const [tags, setTags] = useState(["Vegetables", "Cooking", "Household", "Beverage", "Refrigerated", "Organic", "Office", "Storage", "Packaging", "Grains", "High-Protein", "Baking"])
  const [expirationDate, setExpirationDate] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    if (!item.trim()) {
      alert('Item name cannot be empty.')
      return
    }
  
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
  
    if (docSnap.exists()) {
      const docData = docSnap.data()
      const { quantity = 0, category, tags, expirationDate } = docData
  
      // Update only the quantity field
      const updateData = {
        quantity: quantity + 1
      };
  
      // Include category and expirationDate only if they are defined
      if (category !== undefined) updateData.category = category;
      if (expirationDate !== undefined) updateData.expirationDate = expirationDate;
  
      await updateDoc(docRef, updateData)
    } else {
      // Create the document if it does not exist
      await setDoc(docRef, {
        quantity: 1,
        category: selectedCategories.join(', '),
        tags: selectedTags,
        expirationDate
      })
    }
  
    await updateInventory()
  }

  const removeItem = async (item) => {
    if (!item.trim()) {
      alert('Item name cannot be empty.')
      return
    }
  
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
  
    if (docSnap.exists()) {
      const docData = docSnap.data()
      const { quantity = 0, category, expirationDate } = docData
  
      if (quantity > 1) {
        // Update only the quantity field
        const updateData = {
          quantity: quantity - 1
        };
  
        // Include category and expirationDate only if they are defined
        if (category !== undefined) updateData.category = category;
        if (expirationDate !== undefined) updateData.expirationDate = expirationDate;
  
        await updateDoc(docRef, updateData)
      } else {
        // Remove the document if quantity is 1
        await deleteDoc(docRef)
      }
    }
  
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter(item => {
    const itemMatchesCategory = !selectedCategories.length || selectedCategories.includes(item.category)
    const itemMatchesTag = !selectedTags.length || item.tags?.some(tag => selectedTags.includes(tag))
    const itemMatchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return itemMatchesCategory && itemMatchesTag && itemMatchesSearch
  })

  return (
    <Box 
      width="100vw" 
      padding={2}
      display="flex" 
      flexDirection="row"
    >
      <Box
        width="250px"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        marginRight={2}
      >
        <FormControl variant="outlined" style={{ marginBottom: '10px' }}>
          <InputLabel>Category</InputLabel>
          <Select
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value)}
            renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : ''}
            label="Category"
            style={{ width: '150px' }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                <Checkbox checked={selectedCategories.includes(category)} />
                <ListItemText primary={category} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ marginBottom: '10px' }}>
          <InputLabel>Tags</InputLabel>
          <Select
            multiple
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : ''}
            label="Tags"
            style={{ width: '150px' }}
          >
            {tags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                <Checkbox checked={selectedTags.includes(tag)} />
                <ListItemText primary={tag} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={() => {
            setSelectedCategories([])
            setSelectedTags([])
          }}
          style={{ backgroundColor: "#f5c26b", marginTop: '10px' }} // Updated color
        >
          Clear Filter
        </Button>
      </Box>

      <Box 
        flex={1} 
        display="flex" 
        flexDirection="column"
        alignItems="center"
      >
        <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleOpen}
            style={{ backgroundColor: "#f5c26b" }} // Updated color
          >
            Add New Item
          </Button>
        </Stack>

        <Grid
          container
          spacing={2}
          justifyContent="flex-start" // Ensure items are left-aligned
          marginTop={2}
        >
          {filteredInventory.map(({ name, quantity, category, expirationDate }) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
              <Box
                width="100%"
                minHeight="200px"
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="center"
                bgcolor="#f0f0f0"
                padding={2}
                borderRadius={1}
                boxShadow={2}
                textAlign="left"
              >
                <Typography variant="h6" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body1" color="#333" style={{ marginTop: '8px' }}>
                  Quantity: {quantity}
                </Typography>
                <Typography variant="body2" color="#666" style={{ marginTop: '8px' }}>
                  Category: {category || "N/A"}
                </Typography>
                <Typography variant="body2" color="#666" style={{ marginTop: '8px' }}>
                  Expiration Date: {expirationDate || "N/A"}
                </Typography>
                <Stack direction="row" spacing={1} marginTop={1}>
                  <Button
                    variant="contained"
                    onClick={() => addItem(name)} // Pass name to addItem
                    style={{ backgroundColor: "#f5c26b" }} // color
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => removeItem(name)}
                    style={{ backgroundColor: "#f5c26b" }} // color
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" component="h2">
              Add New Item
            </Typography>
            <TextField
              variant="outlined"
              label="Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={{ marginTop: '10px' }}
            />
            <FormControl variant="outlined" fullWidth style={{ marginTop: '10px' }}>
              <InputLabel>Quantity</InputLabel>
              <Select
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                label="Quantity"
              >
                {[...Array(100).keys()].map(i => (
                  <MenuItem key={i+1} value={i+1}>
                    {i+1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth style={{ marginTop: '10px' }}>
              <InputLabel>Category</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(e.target.value)}
                renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : ''}
                label="Category"
                style={{ width: '150px' }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox checked={selectedCategories.includes(category)} />
                    <ListItemText primary={category} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth style={{ marginTop: '10px' }}>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={selectedTags}
                onChange={(e) => setSelectedTags(e.target.value)}
                renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : ''}
                label="Tags"
                style={{ width: '150px' }}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    <Checkbox checked={selectedTags.includes(tag)} />
                    <ListItemText primary={tag} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              variant="outlined"
              label="Expiration Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              style={{ marginTop: '10px' }}
            />
            <Stack direction="row" spacing={2} marginTop={2}>
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName) // Call addItem with the current item name
                  setItemName('')
                  setQuantity('')
                  setExpirationDate('')
                  setSelectedCategories([])
                  setSelectedTags([])
                  handleClose()
                }}
                style={{ backgroundColor: "#f5c26b" }} // color
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Box>
  )
}