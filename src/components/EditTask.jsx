// EditTask.jsx
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function EditTask({ show, task, onChange, onSave, onClose }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formTitle" className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Título"
              value={task.title || ''}
              onChange={(e) => onChange({ ...task, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="formDescription" className="mb-3">
            <Form.Label>Descripción Breve</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Descripción breve"
              value={task.description || ''}
              onChange={(e) => onChange({ ...task, description: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="formExtendedDescription" className="mb-3">
            <Form.Label>Descripción Extendida</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Descripción detallada del producto"
              value={task.extendedDescription || ''}
              onChange={(e) => onChange({ ...task, extendedDescription: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="formStock" className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              placeholder="Stock"
              value={task.stock || ''}
              onChange={(e) => onChange({ ...task, stock: Number(e.target.value) })}
            />
          </Form.Group>

          <Form.Group controlId="formStatus" className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              value={task.status ? 'true' : 'false'}
              onChange={(e) => onChange({ ...task, status: e.target.value === 'true' })}
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
              value={task.imageUrl || ''}
              onChange={(e) => onChange({ ...task, imageUrl: e.target.value })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditTask;
