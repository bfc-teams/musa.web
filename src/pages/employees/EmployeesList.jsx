import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ name: '', role: '', email: '' });
  const limit = 10;

  const debouncedFilters = useDebounce(filters, 1000);

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage, debouncedFilters]);

  const fetchEmployees = async (page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...debouncedFilters,
      }).toString();
      const response = await api.get(`/employees?${queryParams}`);
      console.log('Employees API Response:', response.data); // Debugging
      setEmployees(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este empleado?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees(currentPage);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: 'role' },
    { header: 'Teléfono', accessor: 'phone' },
  ];

  const actions = (row) => (
    <>
      <Link
        to={`/employees/${row.id}/edit`}
        className="hover:text-primary"
        title="Edit"
      >
        <Edit className="h-5 w-5" />
      </Link>
      <button
        onClick={() => handleDelete(row.id)}
        className="hover:text-meta-1"
        title="Delete"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Empleados
        </h2>
        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Agregar Empleado
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/3">
            <input
              type="text"
              name="name"
              placeholder="Filtrar por Nombre"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <input
              type="text"
              name="email"
              placeholder="Filtrar por Email"
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Todos los Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STYLIST">Estilista</option>
              <option value="RECEPTIONIST">Recepcionista</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <Table columns={columns} data={employees} actions={actions} />
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
