// InventorySummary.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, Container, Spinner, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js'; // Importación de html2pdf
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { AuthContext } from './AuthContext';

function InventorySummary() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // Producto seleccionado para historial
  const [showHistoryModal, setShowHistoryModal] = useState(false); // Estado del modal
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);
  const summaryRef = useRef(); // Referencia para el contenedor HTML

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
    // Selecciona los elementos que se deben ocultar temporalmente
    const historyColumn = document.querySelectorAll('.historial-col'); // Columnas de Historial
    const headerHistory = document.querySelector('.header-historial'); // Encabezado de Historial
    const buttonsContainer = document.querySelector('.buttons-container'); // Contenedor de los botones
  
    // Ocultar elementos temporalmente
    historyColumn.forEach((col) => (col.style.display = 'none'));
    headerHistory.style.display = 'none';
    buttonsContainer.style.display = 'none';
  
    const element = summaryRef.current;
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
        // Restaurar la visibilidad de los elementos después de generar el PDF
        historyColumn.forEach((col) => (col.style.display = ''));
        headerHistory.style.display = '';
        buttonsContainer.style.display = '';
      });
  };
  
  const handleHistory = (product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
  };

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
    {/* Encabezado */}
    <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm rounded">
      <div className="d-flex align-items-center">
        <img src="/logo.png" alt="Logo Empresa" className="logo" />
        <h1 className="text-primary fw-bold mb-0 ms-3">Resumen de Inventario</h1>
      </div>
      <div className="buttons-container">
        {userRole === 'owner' && (
          <Button variant="primary" className="me-2" onClick={generatePDF}>
            Generar PDF
          </Button>
        )}
        <Button variant="secondary" onClick={() => navigate('/')}>
          &larr; Volver al Inventario
        </Button>
      </div>
    </header>

    {/* Tabla de Productos */}
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Nombre del Producto</th>
          <th>Stock</th>
          <th>Última Modificación</th>
          <th>Cambio Generado</th>
          <th className="header-historial">Historial</th>
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
            const stockChangeSign =
              product.lastStockChangeAmount > 0 ? '+' : '';
            cambioGenerado += ` (${stockChangeSign}${product.lastStockChangeAmount})`;
          }

          return (
            <tr key={product.id}>
              <td>{product.title}</td>
              <td>{product.stock}</td>
              <td>{lastModifiedDate}</td>
              <td>{cambioGenerado}</td>
              <td className="historial-col">
                <Button variant="outline-info" size="sm">
                  Ver Historial
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>
</Container>


  );
}

export default InventorySummary;
