import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';

export const EmployeeSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees?limit=100&fetchAll=true');
      const allEmployees = response.data.data || response.data || [];
      setEmployees(
        allEmployees.filter((employee) =>
          `${employee.EmployeeRole?.name || employee.role || ''}`.toLowerCase().includes('estilist')
        )
      );
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (employee) => {
    onSelect(employee);
    // Modal will be closed by the parent or we can close it here if onSelect is async/fire-and-forget
    // Usually better to let parent control open state, but for selection we can auto-close if parent handles it.
    // Parent logic: onSelect(emp) -> api call -> success -> onClose()
  };

  const filteredEmployees = employees.filter(e =>
    `${e.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Seleccionar Empleado
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="mb-6 max-h-60 overflow-y-auto border border-stroke rounded dark:border-strokedark">
          {loading ? (
            <p className="p-4 text-center">Cargando empleados...</p>
          ) : filteredEmployees.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-2 dark:bg-meta-4">
                <tr>
                  <th className="p-3 font-medium text-black dark:text-white">Nombre</th>
                  <th className="p-3 font-medium text-black dark:text-white">Rol</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-stroke last:border-b-0 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 cursor-pointer"
                    onClick={() => handleSelect(employee)}
                  >
                    <td className="p-3">{employee.name}</td>
                    <td className="p-3">{employee.EmployeeRole?.name || employee.role}</td>
                    <td className="p-3 text-right">
                      <button className="text-primary hover:underline">Seleccionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-center text-gray-500">No se encontraron empleados</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
