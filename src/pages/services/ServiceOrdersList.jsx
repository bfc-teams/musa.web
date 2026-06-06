import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { CheckCircle2, Edit, Plus, UserPlus, X } from 'lucide-react';
import { format } from 'date-fns';
import { EmployeeSelectionModal } from '@/components/EmployeeSelectionModal';
import { useDebounce } from '@/hooks/useDebounce';

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
];

const getServiceProgressMeta = (services = []) => {
  const total = services.length;
  const completed = services.filter((item) => item.status === 'completed').length;
  const cancelled = services.filter((item) => item.status === 'cancelled').length;
  const pending = services.filter((item) => item.status === 'pending' || item.status === 'assigned').length;

  return { total, completed, cancelled, pending };
};

const ProgressBar = ({ services }) => {
  const { total, completed, cancelled, pending } = getServiceProgressMeta(services);

  if (!total) {
    return <span className="text-sm text-gray-500">Sin servicios</span>;
  }

  const completedWidth = (completed / total) * 100;
  const cancelledWidth = (cancelled / total) * 100;
  const pendingWidth = Math.max(0, 100 - completedWidth - cancelledWidth);

  return (
    <div className="min-w-[240px]">
      <div className="mb-2 h-4 w-[210px] overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <div className="flex h-full w-full">
          {completedWidth > 0 && (
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${completedWidth}%` }}
              title={`${completed} servicio(s) completado(s)`}
            />
          )}
          {cancelledWidth > 0 && (
            <div
              className="h-full bg-rose-500"
              style={{ width: `${cancelledWidth}%` }}
              title={`${cancelled} servicio(s) cancelado(s)`}
            />
          )}
          {pendingWidth > 0 && (
            <div
              className="h-full bg-slate-300"
              style={{ width: `${pendingWidth}%` }}
              title={`${pending} servicio(s) pendiente(s)`}
            />
          )}
        </div>
      </div>
      <p className="text-xs leading-5 text-slate-600">
        {completed} completado(s) - {cancelled} cancelado(s) - {pending} pendiente(s)
      </p>
    </div>
  );
};

const CompleteOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  paymentMethod,
  setPaymentMethod,
  isSubmitting,
}) => {
  const progressMeta = useMemo(
    () => getServiceProgressMeta(order?.OrderServices || []),
    [order]
  );

  if (!isOpen || !order) {
    return null;
  }

  const hasIncompleteServices = progressMeta.pending > 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Completar orden
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {order.code} · {order.customer_name || 'Cliente casual'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Avance de la orden
            </p>
            <ProgressBar services={order.OrderServices || []} />
          </div>

          {hasIncompleteServices && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Esta orden todavia tiene servicios sin completar. Si continuas, se registrara el pago igual, pero las comisiones seguiran contando solo para los servicios completados.
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Metodo de pago
            </label>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-xl border border-stroke bg-transparent px-4 py-3 text-slate-900 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-meta-4 dark:text-slate-200">
            Total a cobrar: <span className="font-semibold text-slate-900 dark:text-white">Bs. {Number(order.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-stroke px-6 py-4 dark:border-strokedark">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stroke px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50 dark:border-strokedark dark:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Procesando...' : 'Registrar pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ServiceOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', customer_name: '', startDate: '', endDate: '' });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderToAssign, setSelectedOrderToAssign] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedOrderToComplete, setSelectedOrderToComplete] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
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

  const handleOpenComplete = (order) => {
    setSelectedOrderToComplete(order);
    setPaymentMethod('cash');
    setCompleteModalOpen(true);
  };

  const handleAssignEmployee = async (employee) => {
    if (!selectedOrderToAssign) return;
    try {
      const items = (selectedOrderToAssign.OrderServices || []).map((item) => ({
        id: item.id,
        employee_id: employee.id,
        status: item.status === 'pending' ? 'assigned' : item.status,
        observation: item.observation || '',
      }));

      await api.put(`/service-orders/${selectedOrderToAssign.id}`, {
        items,
      });
      setAssignModalOpen(false);
      setSelectedOrderToAssign(null);
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('Error al asignar empleado');
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrderToComplete) return;

    try {
      setIsCompletingOrder(true);
      await api.post(`/service-orders/${selectedOrderToComplete.id}/complete`, {
        payment_method: paymentMethod,
      });
      setCompleteModalOpen(false);
      setSelectedOrderToComplete(null);
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Error completing order:', error);
      alert(error.response?.data?.message || 'Error al registrar el pago de la orden');
    } finally {
      setIsCompletingOrder(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-warning/10 text-warning dark:bg-warning/40 dark:text-white',
      assigned: 'bg-primary/10 text-primary dark:bg-primary/40 dark:text-white',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/30 dark:text-white',
      completed: 'bg-success/10 text-success dark:bg-success/40 dark:text-white',
      cancelled: 'bg-danger/10 text-danger dark:bg-danger/40 dark:text-white',
    };

    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En progreso',
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
    { header: 'Codigo', accessor: 'code' },
    { header: 'Cliente', accessor: 'customer_name', render: (row) => row.customer_name || 'Cliente casual' },
    {
      header: 'Servicios',
      accessor: 'id',
      render: (row) => {
        const count = row.OrderServices?.length || 0;
        const names = row.OrderServices?.map((service) => service.Service?.name).slice(0, 2).join(', ');
        return count > 2 ? `${names} +${count - 2}` : names || 'Sin servicios';
      }
    },
    {
      header: 'Total',
      accessor: 'total_amount',
      render: (row) => row.total_amount ? `Bs. ${Number(row.total_amount).toFixed(2)}` : 'Bs. 0.00'
    },
    {
      header: 'Fecha',
      accessor: 'date',
      render: (row) => format(new Date(row.date), 'dd/MM/yyyy')
    },
    {
      header: 'Avance',
      accessor: 'OrderServices',
      render: (row) => <ProgressBar services={row.OrderServices || []} />
    },
    { header: 'Estado', accessor: 'status', render: (row) => getStatusBadge(row.status) },
  ];

  const actions = (row) => (
    <div className="flex items-center gap-3">
      {row.status === 'pending' && (
        <button
          onClick={() => handleOpenAssign(row)}
          className="hover:text-primary"
          title="Asignar empleado"
        >
          <UserPlus className="h-5 w-5" />
        </button>
      )}
      {!row.Sale && (
        <button
          onClick={() => handleOpenComplete(row)}
          className="hover:text-success"
          title="Registrar pago"
        >
          <CheckCircle2 className="h-5 w-5" />
        </button>
      )}
      <Link
        to={`/service-orders/${row.id}`}
        className="hover:text-primary"
        title="Ver / Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Ordenes de Servicio
        </h2>
        <Link
          to="/service-orders/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Nueva Orden
        </Link>
      </div>

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
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="assigned">Asignado</option>
              <option value="in_progress">En progreso</option>
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

      <CompleteOrderModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleCompleteOrder}
        order={selectedOrderToComplete}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isSubmitting={isCompletingOrder}
      />
    </>
  );
};

