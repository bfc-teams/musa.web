import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ name: '', email: '' });
  const limit = 10;

  const debouncedFilters = useDebounce(filters, 1000);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage, debouncedFilters]);

  const fetchCustomers = async (page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...debouncedFilters,
      }).toString();
      const response = await api.get(`/customers?${queryParams}`);
      setCustomers(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers(currentPage);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' },
    { header: 'RUT/DNI', accessor: 'documentIdentification', render: (row) => row.documentIdentification || '-' },
    { header: 'Email', accessor: 'email', render: (row) => row.email || '-' },
    { header: 'Teléfono', accessor: 'phone', render: (row) => row.phone || '-' },
    { header: 'Ciudad', accessor: 'city', render: (row) => row.city || '-' },
  ];

  const actions = (row) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/customers/${row.id}`}
        className="hover:text-primary"
        title="Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
      <button
        onClick={() => handleDelete(row.id)}
        className="hover:text-danger"
        title="Eliminar"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Clientes
        </h2>
        <Link
          to="/customers/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              name="name"
              placeholder="Buscar por Nombre..."
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              name="email"
              placeholder="Buscar por Email..."
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <Table columns={columns} data={customers} actions={actions} />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </>
  );
};
