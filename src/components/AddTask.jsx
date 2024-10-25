// AddTask.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function AddTask() {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    extendedDescription: '',
    stock: 0,
    status: true,
    imageUrl: '',
  });

  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'viewer') {
      navigate('/'); // Redirigir si el usuario no tiene permiso
    }
  }, [userRole, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: name === 'stock' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'task'), {
        ...newTask,
        lastModified: Timestamp.now(),
        lastChangeType: 'Creación',
        lastStockChangeAmount: Number(newTask.stock),
      });
      navigate('/');
    } catch (err) {
      console.error('Error al agregar el producto:', err);
    }
  };

  return (
    <Container className="mt-5">
      {/* Encabezado */}
      <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm rounded">
        <div className="d-flex align-items-center">
          <img src="/logo.png" alt="Logo Empresa" className="logo" />
          <h1 className="text-primary fw-bold mb-0 ms-3">Agregar Nuevo Producto</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          &larr; Volver al Inventario
        </Button>
      </header>

      {/* Formulario */}
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formTitle" className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Título"
                    name="title"
                    value={newTask.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formStock" className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Stock"
                    name="stock"
                    value={newTask.stock}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formStatus" className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={newTask.status ? 'true' : 'false'}
                    onChange={(e) =>
                      setNewTask({ ...newTask, status: e.target.value === 'true' })
                    }
                    required
                  >
                    <option value="true">Disponible</option>
                    <option value="false">No disponible</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formImageUrl" className="mb-3">
                  <Form.Label>URL de la Imagen</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="URL de la Imagen"
                    name="imageUrl"
                    value={newTask.imageUrl}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="formDescription" className="mb-3">
                  <Form.Label>Descripción Breve</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Descripción breve"
                    name="description"
                    value={newTask.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formExtendedDescription" className="mb-3">
                  <Form.Label>Descripción Extendida</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={7}
                    placeholder="Descripción detallada del producto"
                    name="extendedDescription"
                    value={newTask.extendedDescription}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Agregar Producto
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddTask;
