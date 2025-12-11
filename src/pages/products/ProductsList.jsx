import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ name: '', sku: '', category: '' });
  const [showStock, setShowStock] = useState(false);
  const limit = 10;

  const debouncedFilters = useDebounce(filters, 1000);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, debouncedFilters, showStock]);

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...debouncedFilters,
        stock: showStock ? '1' : '0',
      }).toString();
      const response = await api.get(`/products?${queryParams}`);
      console.log('Products API Response:', response.data); // Debugging
      setProducts(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
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
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts(currentPage);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Categoría', accessor: 'category' },
    { header: 'Precio', accessor: 'sale_price', render: (row) => `$${Number(row.sale_price || 0).toFixed(2)}` },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (row) => {
        if (showStock && row.ProductStocks && row.ProductStocks.length > 0) {
          return (
            <div className="flex flex-col gap-1">
              {row.ProductStocks.map((stock) => (
                <div key={stock.id} className="text-sm">
                  <span className="font-semibold">{stock.Warehouse?.name || 'Desconocido'}:</span> {stock.quantity}
                </div>
              ))}
              <div className="border-t border-gray-200 pt-1 mt-1 font-bold">
                Total: {row.ProductStocks.reduce((sum, s) => sum + s.quantity, 0)}
              </div>
            </div>
          );
        }
        return row.stock || 0;
      }
    },
  ];

  const actions = (row) => (
    <>
      <Link
        to={`/products/${row.id}/edit`}
        className="hover:text-primary"
        title="Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
      <button
        onClick={() => handleDelete(row.id)}
        className="hover:text-meta-1"
        title="Eliminar"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Productos
        </h2>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Agregar Producto
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/4">
            <input
              type="text"
              name="name"
              placeholder="Filtrar por Nombre"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/4">
            <input
              type="text"
              name="sku"
              placeholder="Filtrar por SKU"
              value={filters.sku}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-1/4">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Todas las Categorías</option>
              <option value="Hair Care">Cuidado del Cabello</option>
              <option value="Skin Care">Cuidado de la Piel</option>
              <option value="Color">Color</option>
              <option value="Tools">Herramientas</option>
            </select>
          </div>
          <div className="flex w-full items-center sm:w-1/4">
            <label className="flex cursor-pointer items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={showStock}
                  onChange={(e) => setShowStock(e.target.checked)}
                />
                <div className={`block h-8 w-14 rounded-full ${showStock ? 'bg-primary' : 'bg-gray-300 dark:bg-form-input'}`}></div>
                <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${showStock ? 'translate-x-6' : ''}`}></div>
              </div>
              <div className="ml-3 text-black dark:text-white">
                Mostrar Stock
              </div>
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <Table columns={columns} data={products} actions={actions} />
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
