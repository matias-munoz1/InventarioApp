// TaskList.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditTask from './EditTask';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { AuthContext } from './AuthContext';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext); // Obtener el rol del usuario

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'task'));
      const fetchedTasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(fetchedTasks);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener los productos:', err);
      setError('No se pudieron cargar los productos.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEdit = (task) => {
    setEditTask(task);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      const taskRef = doc(db, 'task', editTask.id);

      // Obtener el stock anterior
      const previousTask = tasks.find((task) => task.id === editTask.id);
      const previousStock = previousTask?.stock || 0;

      // Calcular el cambio en el stock
      const stockChange = Number(editTask.stock) - previousStock;

      // Determinar el tipo de cambio y el monto
      let changeType = 'Actualización';
      let stockChangeAmount = 0;
      if (stockChange !== 0) {
        if (stockChange > 0) {
          changeType = 'Incremento de Stock';
        } else {
          changeType = 'Decremento de Stock';
        }
        stockChangeAmount = stockChange;
      } else if (
        editTask.title !== previousTask.title ||
        editTask.description !== previousTask.description ||
        editTask.extendedDescription !== previousTask.extendedDescription ||
        editTask.status !== previousTask.status ||
        editTask.imageUrl !== previousTask.imageUrl
      ) {
        changeType = 'Actualización de Detalles';
      }

      await updateDoc(taskRef, {
        ...editTask,
        stock: Number(editTask.stock),
        lastModified: Timestamp.now(),
        lastChangeType: changeType,
        lastStockChangeAmount: stockChangeAmount,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editTask.id
            ? {
                ...editTask,
                lastModified: Timestamp.now(),
                lastChangeType: changeType,
                lastStockChangeAmount: stockChangeAmount,
              }
            : task
        )
      );
      setShowEditModal(false);
      setEditTask(null);
    } catch (err) {
      console.error('Error al actualizar el producto:', err);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditTask(null);
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Registrar el movimiento de eliminación (opcional)
      await deleteDoc(doc(db, 'task', taskToDelete.id));

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete.id));
      setTaskToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-5">
        <span className="spinner-border" role="status" aria-hidden="true"></span> Cargando
        productos...
      </p>
    );
  }
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-5">
      {/* Encabezado */}
      <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm rounded">
        <div className="d-flex align-items-center">
          <img src="/logo.png" alt="Logo Empresa" className="logo" />
          <h1 className="text-primary fw-bold mb-0 ms-3">Inventario de Tienda</h1>
        </div>
        <div>
          {userRole !== 'viewer' && (
            <button className="btn btn-success me-2" onClick={() => navigate('/add')}>
              Agregar Producto
            </button>
          )}
          <button className="btn btn-info me-2" onClick={() => navigate('/summary')}>
            Resumen de Inventario
          </button>
          <Button variant="danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Lista de Productos */}
      <div className="row">
        {tasks.map((task) => (
          <div key={task.id} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <img
                src={task.imageUrl || '/default-image.png'}
                className="card-img-top"
                alt={task.title}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{task.title}</h5>
                <p className="card-text">{task.description}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`badge ${task.status ? 'bg-success' : 'bg-secondary'}`}>
                    {task.status ? 'Disponible' : 'No disponible'}
                  </span>
                </p>
                <p>
                  <strong>Stock:</strong> {task.stock}
                </p>
                {userRole !== 'viewer' && (
                  <div className="mt-auto d-flex justify-content-between">
                    <button className="btn btn-warning btn-sm" onClick={() => handleEdit(task)}>
                      <FaEdit /> Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task)}>
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                )}
                <div className="mt-2">
                  <Link to={`/product/${task.id}`} className="btn btn-info btn-sm w-100">
                    Más Información
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edición */}
      {editTask && (
        <EditTask
          show={showEditModal}
          task={editTask}
          onChange={setEditTask}
          onSave={handleSave}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar este producto?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TaskList;
