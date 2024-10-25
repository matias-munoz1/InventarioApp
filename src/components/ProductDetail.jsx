// ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button, Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'task', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('El producto no existe');
        }
      } catch (error) {
        console.error('Error al obtener el producto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5 text-center">
        <h3>Producto no encontrado</h3>
        <Button variant="primary" onClick={() => navigate('/')}>
          Volver al Inventario
        </Button>
      </Container>
    );
  }

  return (
    <div className="container mt-5">
      <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm rounded">
        <div className="d-flex align-items-center">
          <img src="/logo.png" alt="Logo Empresa" className="logo" />
          <h1 className="text-primary fw-bold mb-0 ms-3">Detalles del Producto</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          &larr; Volver al Inventario
        </Button>
      </header>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 text-center">
              <img
                src={product.imageUrl || '/default-image.png'}
                alt={product.title}
                className="img-fluid rounded mb-3"
                style={{ maxWidth: '300px', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div className="col-md-6">
              <h2 className="card-title">{product.title}</h2>
              <p className="card-text">{product.extendedDescription}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className={`badge ${product.status ? 'bg-success' : 'bg-secondary'}`}>
                  {product.status ? 'Disponible' : 'No disponible'}
                </span>
              </p>
              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
