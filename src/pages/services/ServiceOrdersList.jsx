import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Edit, Plus, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { EmployeeSelectionModal } from '@/components/EmployeeSelectionModal';
import { useDebounce } from '@/hooks/useDebounce';

export const ServiceOrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', customer_name: '', startDate: '', endDate: '' });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderToAssign, setSelectedOrderToAssign] = useState(null);
  const limit = 10;

  const debouncedFilters = useDebounce(filters, 1000);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, debouncedFilters]);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...debouncedFilters,
      }).toString();
      const response = await api.get(`/service-orders?${queryParams}`);
      setOrders(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching service orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (order) => {
    setSelectedOrderToAssign(order);
    setAssignModalOpen(true);
  };

  const handleAssignEmployee = async (employee) => {
    if (!selectedOrderToAssign) return;
    try {
      await api.put(`/service-orders/${selectedOrderToAssign.id}`, {
        employee_id: employee.id,
        status: 'assigned'
      });
      setAssignModalOpen(false);
      setSelectedOrderToAssign(null);
      fetchOrders(currentPage); // Refresh list
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('Error al asignar empleado');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-warning/10 text-warning dark:bg-warning/40 dark:text-white',
      assigned: 'bg-primary/10 text-primary dark:bg-primary/40 dark:text-white',
      completed: 'bg-success/10 text-success dark:bg-success/40 dark:text-white',
      cancelled: 'bg-danger/10 text-danger dark:bg-danger/40 dark:text-white',
    };

    // Translate status for display
    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const columns = [
    { header: 'Código', accessor: 'code' },
    { header: 'Cliente', accessor: 'customer_name', render: (row) => row.customer_name || 'Cliente Casual' },
    {
      header: 'Servicios',
      accessor: 'id',
      render: (row) => {
        const count = row.OrderServices?.length || 0;
        const names = row.OrderServices?.map(s => s.Service?.name).slice(0, 2).join(', ');
        return count > 2 ? `${names} +${count - 2}` : names || 'Sin servicios';
      }
    },
    {
      header: 'Total',
      accessor: 'total_amount',
      render: (row) => row.total_amount ? `$${Number(row.total_amount).toFixed(2)}` : '$0.00'
    },
    {
      header: 'Fecha',
      accessor: 'date',
      render: (row) => format(new Date(row.date), 'dd/MM/yyyy')
    },
    { header: 'Estado', accessor: 'status', render: (row) => getStatusBadge(row.status) },
  ];

  const actions = (row) => (

    <div className="flex items-center gap-2">
      {row.status === 'pending' && (
        <button
          onClick={() => handleOpenAssign(row)}
          className="hover:text-primary"
          title="Asignar Empleado"
        >
          <UserPlus className="h-5 w-5" />
        </button>
      )}
      <Link
        to={`/service-orders/${row.id}`}
        className="hover:text-primary"
        title="Ver/Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Órdenes de Servicio
        </h2>
        <Link
          to="/service-orders/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Nueva Orden
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/4">
            <input
              type="text"
              name="customer_name"
              placeholder="Buscar por Cliente..."
              value={filters.customer_name}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Todos los Estados</option>
              <option value="pending">Pendiente</option>
              <option value="assigned">Asignado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="w-full sm:w-1/4">
            <input
              type="date"
              name="startDate"
              value={filters.startDate || ''}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/4">
            <input
              type="date"
              name="endDate"
              value={filters.endDate || ''}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <Table columns={columns} data={orders} actions={actions} />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      <EmployeeSelectionModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={handleAssignEmployee}
      />
    </>
  );
};
