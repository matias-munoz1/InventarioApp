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
import '../TaskList.css';
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

  useEffect(() => {
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
    fetchTasks();
  }, []);

  const handleEdit = (task) => {
    setEditTask(task);
    setShowEditModal(true);
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'task', taskToDelete.id));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete.id));
      setTaskToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
    }
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
        <span className="spinner-border" role="status" aria-hidden="true"></span> Cargando productos...
      </p>
    );
  }
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-5">
      <header className="d-flex justify-content-between align-items-center mb-4 p-4 bg-light shadow rounded">
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
          <Button variant="outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="row">
        {tasks.map((task) => (
          <div key={task.id} className="col-md-4 mb-4">
            <div className="card shadow-lg h-100 border-0">
              <div className="card-img-container">
                <img
                  src={task.imageUrl || '/default-image.png'}
                  className="card-img-top rounded-top"
                  alt={task.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">{task.title}</h5>
                <p className="card-text text-muted">{task.description}</p>
                <p className="mb-1">
                  <strong>Estado:</strong>{' '}
                  <span className={`badge ${task.status ? 'bg-success' : 'bg-secondary'}`}>
                    {task.status ? 'Disponible' : 'No disponible'}
                  </span>
                </p>
                <p>
                  <strong>Stock:</strong> {task.stock}
                </p>

                <div className="mt-auto">
                  <Link to={`/product/${task.id}`} className="btn btn-outline-info w-100 mb-2">
                    Más Información
                  </Link>
                  {userRole !== 'viewer' && (
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-warning w-50 me-2"
                        onClick={() => handleEdit(task)}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="btn btn-danger w-50"
                        onClick={() => handleDelete(task)}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editTask && (
        <EditTask
          show={showEditModal}
          task={editTask}
          onChange={setEditTask}
          onSave={() => setShowEditModal(false)}
        />
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar este producto?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
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
