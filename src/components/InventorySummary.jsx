// InventorySummary.jsx
import React, { useEffect, useState, useContext } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, Container, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { AuthContext } from './AuthContext';

// Registrar las fuentes para pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function InventorySummary() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext); // Obtener el rol del usuario

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener productos
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
    const docDefinition = {
      content: [
        { text: 'Resumen de Inventario', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', '*', '*'],
            body: [
              [
                { text: 'Nombre del Producto', style: 'tableHeader' },
                { text: 'Stock', style: 'tableHeader' },
                { text: 'Última Modificación', style: 'tableHeader' },
                { text: 'Cambio Generado', style: 'tableHeader' },
              ],
              ...products.map((product) => {
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

                return [
                  { text: product.title, style: 'tableData' },
                  {
                    text: product.stock.toString(),
                    style: 'tableData',
                    alignment: 'center',
                  },
                  { text: lastModifiedDate, style: 'tableData' },
                  { text: cambioGenerado, style: 'tableData' },
                ];
              }),
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'white',
          fillColor: '#2d4154',
          alignment: 'center',
        },
        tableData: {
          fontSize: 10,
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
    };

    pdfMake.createPdf(docDefinition).download('Resumen_de_Inventario.pdf');
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
      {/* Encabezado */}
      <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light shadow-sm rounded">
        <div className="d-flex align-items-center">
          <img src="/logo.png" alt="Logo Empresa" className="logo" />
          <h1 className="text-primary fw-bold mb-0 ms-3">Resumen de Inventario</h1>
        </div>
        <div>
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
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}

export default InventorySummary;
