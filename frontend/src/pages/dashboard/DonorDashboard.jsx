import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { getLots, createLot, addFoodItem } from '../../services/lotService'; // Import our new services
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the "Create Lot" modal
  const [showLotModal, setShowLotModal] = useState(false);
  const [newLotData, setNewLotData] = useState({ description: '', totalItems: 1 });

  // State for the "Add Food Item" modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [newItemData, setNewItemData] = useState({
    itemName: '', category: '', expiryDate: '', quantity: 1, unitOfMeasure: ''
  });

  // Function to fetch lots from the backend
  const fetchLots = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You are not logged in.');
      setIsLoading(false);
      return;
    }
    const result = await getLots(token);
    if (result.success) {
      setLots(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // useEffect runs once when the component loads
  useEffect(() => {
    fetchLots();
  }, []);

  // --- Handlers for Lot Modal ---
  const handleLotChange = (e) => setNewLotData({ ...newLotData, [e.target.name]: e.target.value });
  const handleLotSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const loadingToast = toast.loading('Creating lot...');
    const result = await createLot(newLotData, token);
    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success('Lot created successfully!');
      setShowLotModal(false);
      fetchLots(); // Refresh the list of lots
    } else {
      toast.error(`Failed to create lot: ${result.message}`);
    }
  };

  // --- Handlers for Item Modal ---
  const handleShowItemModal = (lotId) => {
    setSelectedLotId(lotId); // Remember which lot we're adding to
    setShowItemModal(true);
  };
  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setSelectedLotId(null);
  };
  const handleItemChange = (e) => setNewItemData({ ...newItemData, [e.target.name]: e.target.value });
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const loadingToast = toast.loading('Adding item...');
    const result = await addFoodItem(selectedLotId, newItemData, token);
    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success('Item added successfully!');
      setShowItemModal(false);
      fetchLots(); // Refresh lots to update total_items count if necessary
    } else {
      toast.error(`Failed to add item: ${result.message}`);
    }
  };


  return (
    <Container className="py-5">
      <h1 className="mb-4">My Donation Lots</h1>
      <Button onClick={() => setShowLotModal(true)} className="mb-4">Create New Lot</Button>

      {isLoading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {lots.map(lot => (
          <Col md={6} lg={4} key={lot.lotId} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Lot ID: {lot.lotId.substring(0, 8)}...</Card.Title>
                <Card.Text>{lot.description}</Card.Text>
                <p><strong>Status:</strong> {lot.status}</p>
                <p><strong>Items:</strong> {lot.totalItems}</p>
                <p><strong>Created:</strong> {new Date(lot.createdAt).toLocaleDateString()}</p>
                <Button variant="secondary" onClick={() => handleShowItemModal(lot.lotId)}>
                  Add Food Item
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for Creating a New Lot */}
      <Modal show={showLotModal} onHide={() => setShowLotModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Donation Lot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLotSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" name="description" onChange={handleLotChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total Items (Initial Estimate)</Form.Label>
              <Form.Control type="number" name="totalItems" min="1" onChange={handleLotChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">Create Lot</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Adding a New Food Item */}
      <Modal show={showItemModal} onHide={handleCloseItemModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item to Lot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleItemSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control type="text" name="itemName" onChange={handleItemChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" name="category" onChange={handleItemChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control type="date" name="expiryDate" onChange={handleItemChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" name="quantity" min="1" onChange={handleItemChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unit of Measure (e.g., kg, lbs, units)</Form.Label>
              <Form.Control type="text" name="unitOfMeasure" onChange={handleItemChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">Add Item</Button>
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
}