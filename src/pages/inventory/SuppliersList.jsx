import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Edit, Trash2, Plus } from 'lucide-react';

export const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ name: '', email: '' });
  const limit = 10;

  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [currentPage, filters]);

  const fetchSuppliers = async (page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      }).toString();
      const response = await api.get(`/suppliers?${queryParams}`);
      console.log('Suppliers API Response:', response.data);
      setSuppliers(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers(currentPage);
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Contact Person', accessor: 'contact_info' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
  ];

  const actions = (row) => (
    <>
      <Link
        to={`/inventory/suppliers/${row.id}/edit`}
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
          Suppliers
        </h2>
        <Link
          to="/inventory/suppliers/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          <Plus className="h-5 w-5" />
          Add Supplier
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              name="name"
              placeholder="Filter by Name"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              name="email"
              placeholder="Filter by Email"
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table columns={columns} data={suppliers} actions={actions} />
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
