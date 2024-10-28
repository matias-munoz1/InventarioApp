import React, { useEffect, useState, useContext, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, Container, Spinner, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function InventorySummary() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);
  const summaryRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'task'));
        const fetchedProducts = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener los datos:', err);
      }
    };

    fetchData();
  }, []);

  const generatePDF = () => {
    const element = summaryRef.current;

    // Añade la clase de ocultar
    element.classList.add('hide-for-pdf');
    
    const options = {
      margin: 10,
      filename: 'Resumen_de_Inventario.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .finally(() => {
        // Quita la clase después de generar el PDF
        element.classList.remove('hide-for-pdf');
      });
  };

  const handleViewHistory = (history) => {
    setSelectedHistory(history);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => setShowHistoryModal(false);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div ref={summaryRef}>
        <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm rounded">
          <div className="d-flex align-items-center">
            <img src="/logo.png" alt="Logo Empresa" className="logo" />
            <h1 className="text-primary fw-bold mb-0 ms-3">Resumen de Inventario</h1>
          </div>
          <div>
            {userRole === 'owner' && (
              <Button
                variant="primary"
                className="me-2 no-print"  // Añadir la clase "no-print"
                onClick={generatePDF}
              >
                Generar PDF
              </Button>
            )}
            <Button
              variant="secondary"
              className="no-print"  // Añadir la clase "no-print"
              onClick={() => navigate('/')}
            >
              &larr; Volver al Inventario
            </Button>
          </div>
        </header>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre del Producto</th>
              <th>Stock</th>
              <th>Última Modificación</th>
              <th>Cambio Generado</th>
              <th className="no-print">Historial</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const lastModifiedDate = product.lastModified
                ? product.lastModified.toDate().toLocaleString()
                : 'Sin datos';

              let cambioGenerado = product.lastChangeType || 'Sin cambios';

              if (
                product.lastStockChangeAmount !== undefined &&
                product.lastStockChangeAmount !== 0
              ) {
                const stockChangeSign = product.lastStockChangeAmount > 0 ? '+' : '';
                cambioGenerado += ` (${stockChangeSign}${product.lastStockChangeAmount})`;
              }

              return (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.stock}</td>
                  <td>{lastModifiedDate}</td>
                  <td>{cambioGenerado}</td>
                  <td className="no-print">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleViewHistory(product.history || [])}
                    >
                      Ver Historial
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <Modal show={showHistoryModal} onHide={closeHistoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Historial de Cambios</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHistory.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo de Cambio</th>
                  <th>Cantidad</th>
                  <th>Stock Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {selectedHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.timestamp.toDate().toLocaleString()}</td>
                    <td>{entry.changeType}</td>
                    <td>{entry.stockChangeAmount}</td>
                    <td>{entry.updatedStock}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay historial disponible para este producto.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHistoryModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default InventorySummary;
