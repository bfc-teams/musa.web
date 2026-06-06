import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Plus, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatUtils';
import { ItemDetailsModal } from '@/components/ItemDetailsModal';



export const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage]);

  const fetchSales = async (page) => {
    setLoading(true);
    try {
      // Trying /reports/sales as per reportController logic
      const response = await api.get(`/reports/sales?page=${page}&limit=${limit}`);
      console.log('Sales API Response:', response.data);

      if (Array.isArray(response.data)) {
        setSales(response.data);
        setTotalPages(1);
      } else {
        setSales(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Fecha', accessor: 'date', render: (row) => formatDate(row.date) },
    { header: 'Cliente', accessor: 'customer_name' },
    { header: 'Método de Pago', accessor: 'payment_method' },
    { header: 'Monto Total', accessor: 'total_amount', render: (row) => formatCurrency(row.total_amount) },
    { header: 'Almacén', accessor: 'Warehouse.name', render: (row) => row.Warehouse?.name || 'N/A' },
  ];

  const fetchSaleDetails = async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      setSelectedSale(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      alert('Error al cargar los detalles de la venta');
    }
  };

  const actions = (row) => (
    <>
      <button
        className="hover:text-primary"
        title="Ver Detalles"
        onClick={() => fetchSaleDetails(row.id)}
      >
        <Eye className="h-5 w-5" />
      </button>
    </>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Ventas (POS)
        </h2>
        <Link
          to="/sales/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Nueva Venta
        </Link>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <Table columns={columns} data={sales} actions={actions} />
          <div className="mt-4">
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      )}

      <ItemDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detalles de Venta #${selectedSale?.id}`}
        items={selectedSale?.SaleItems}
        type="sale"
      />
    </>
  );
};
