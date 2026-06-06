import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';

export const ServiceSelectionModal = ({ isOpen, onClose, onAddServices }) => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      setSelectedServices([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services?limit=100');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleAdd = () => {
    onAddServices(selectedServices);
    onClose();
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Seleccionar Servicios
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="mb-6 max-h-60 overflow-y-auto border border-stroke rounded dark:border-strokedark">
          {loading ? (
            <p className="p-4 text-center">Cargando servicios...</p>
          ) : filteredServices.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-2 dark:bg-meta-4">
                <tr>
                  <th className="p-3">
                    <span className="sr-only">Seleccionar</span>
                  </th>
                  <th className="p-3 font-medium text-black dark:text-white">Servicio</th>
                  <th className="p-3 font-medium text-black dark:text-white">Precio</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-stroke last:border-b-0 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 cursor-pointer"
                    onClick={() => toggleService(service)}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={!!selectedServices.find(s => s.id === service.id)}
                        onChange={() => { }} // Handled by row click
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-3">{service.name}</td>
                    <td className="p-3">Bs. {Number(service.base_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-center text-gray-500">No se encontraron servicios</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedServices.length === 0}
            className="rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            Agregar Seleccionados ({selectedServices.length})
          </button>
        </div>
      </div>
    </div>
  );
};
