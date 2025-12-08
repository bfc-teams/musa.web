import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Plus } from 'lucide-react';

export const StockList = () => {
  const [stock, setStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ warehouse_id: '', product_name: '' });
  const limit = 10;

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchStock(currentPage);
  }, [currentPage, filters]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses?fetchAll=true');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchStock = async (page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      }).toString();
      const response = await api.get(`/stock?${queryParams}`);
      console.log('Stock API Response:', response.data);
      setStock(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'Product.name',
      render: (row) => row.Product?.name || 'Unknown'
    },
    {
      header: 'SKU',
      accessor: 'Product.sku',
      render: (row) => row.Product?.sku || '-'
    },
    {
      header: 'Warehouse',
      accessor: 'Warehouse.name',
      render: (row) => row.Warehouse?.name || 'Unknown'
    },
    { header: 'Lot Number', accessor: 'lot_number' },
    {
      header: 'Expiration',
      accessor: 'expiration_date',
      render: (row) => row.expiration_date ? new Date(row.expiration_date).toLocaleDateString() : '-'
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => <span className={`font-semibold ${row.quantity < 10 ? 'text-danger' : 'text-success'}`}>{row.quantity}</span>
    },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Stock Inventory
        </h2>
        <Link
          to="/inventory/transfers/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          <Plus className="h-5 w-5" />
          Transfer Stock
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <select
              name="warehouse_id"
              value={filters.warehouse_id}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              name="product_name"
              placeholder="Filter by Product Name"
              value={filters.product_name}
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
          <Table columns={columns} data={stock} />
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
