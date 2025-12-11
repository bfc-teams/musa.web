import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import api from '@/services/api';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/useDebounce';

export const ProductSelectionModal = ({ isOpen, onClose, onAddProducts }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
      setSelectedProducts([]);
      fetchProducts(1, '');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts(currentPage, debouncedSearch);
    }
  }, [currentPage, debouncedSearch]);

  const fetchProducts = async (page, search) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        name: search, // Assuming backend filters by name with this param
      }).toString();
      const response = await api.get(`/products?${queryParams}`);

      // Handle both mocked (array) and paginated response structures just in case
      if (response.data.data) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        // Fallback or different structure
        setProducts(response.data || []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleAdd = () => {
    onAddProducts(selectedProducts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark flex flex-col max-h-[90vh]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Seleccionar Productos
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 pl-10 pr-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex-1 overflow-y-auto border border-stroke rounded dark:border-strokedark mb-4">
          {loading ? (
            <p className="p-8 text-center text-gray-500">Cargando productos...</p>
          ) : products.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-2 dark:bg-meta-4 sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="p-3 font-medium text-black dark:text-white">Producto</th>
                  <th className="p-3 font-medium text-black dark:text-white">SKU</th>
                  <th className="p-3 font-medium text-black dark:text-white">Precio Venta</th>
                  <th className="p-3 font-medium text-black dark:text-white">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isSelected = !!selectedProducts.find(p => p.id === product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-stroke last:border-b-0 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 cursor-pointer ${isSelected ? 'bg-primary/5 dark:bg-primary/20' : ''}`}
                      onClick={() => toggleProduct(product)}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }} // Handled by row click
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                        />
                      </td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.sku || '-'}</td>
                      <td className="p-3">${Number(product.sale_price).toFixed(2)}</td>
                      <td className="p-3">{product.stock || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-gray-500">No se encontraron productos.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        <div className="flex justify-between items-center border-t border-stroke pt-4 dark:border-strokedark">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedProducts.length} producto(s) seleccionado(s)
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedProducts.length === 0}
              className="rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              Agregar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
