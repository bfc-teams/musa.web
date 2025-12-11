import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import api from '@/services/api';

export const CustomerSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, searchTerm]);

  // Debounce search could be added here, currently relies on fast backend or manual fetch triggers if typing fast
  // For simplicity, we'll fetch on mount and let client filter, OR fetch with search query.
  // Given user wants to filter by docID or Name, backend search is better.

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Use the generic searchTerm endpoint we created
      const response = await api.get(`/customers?limit=20&searchTerm=${searchTerm}`);
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 outline-none focus:outline-none">
      <div className="relative w-full max-w-xl rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Seleccionar Cliente
          </h3>
          <button
            onClick={onClose}
            className="text-black hover:text-primary dark:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Buscar por Nombre o RUT/DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 pl-10 pr-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-center">Cargando...</p>
            ) : customers.length === 0 ? (
              <p className="text-center text-gray-500">No se encontraron clientes</p>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gray-2 text-left dark:bg-meta-4">
                  <tr>
                    <th className="py-2 px-3 font-medium text-black dark:text-white">Nombre</th>
                    <th className="py-2 px-3 font-medium text-black dark:text-white">RUT/DNI</th>
                    <th className="py-2 px-3 font-medium text-black dark:text-white text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-stroke last:border-b-0 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 cursor-pointer"
                      onClick={() => onSelect(customer)}
                    >
                      <td className="p-3">{customer.name}</td>
                      <td className="p-3">{customer.documentIdentification || '-'}</td>
                      <td className="p-3 text-right">
                        <button className="text-primary hover:underline">Seleccionar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
