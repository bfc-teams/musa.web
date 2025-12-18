
import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';

export const ItemDetailsModal = ({ isOpen, onClose, title, items, type = 'product' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-2 dark:bg-meta-4">
              <tr>
                <th className="p-3 font-medium text-black dark:text-white">Ítem</th>
                <th className="p-3 font-medium text-black dark:text-white">Cantidad</th>
                <th className="p-3 font-medium text-black dark:text-white">Precio Unit.</th>
                <th className="p-3 font-medium text-black dark:text-white text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index} className="border-b border-stroke last:border-b-0 dark:border-strokedark">
                    <td className="p-3">
                      <p className="font-medium text-black dark:text-white">
                        {type === 'sale'
                          ? (item.Product?.name || item.Service?.name || item.item_type || 'Desconocido')
                          : (item.Product?.name || 'Producto Desconocido')}
                      </p>
                      <span className="text-xs text-gray-500">
                        {type === 'sale' && item.item_type === 'product' && item.lot_number && `Lote: ${item.lot_number}`}
                        {type === 'purchase' && item.lot_number && `Lote: ${item.lot_number}`}
                      </span>
                    </td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">
                      {formatCurrency(type === 'sale' ? item.unit_price : item.unit_cost)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(
                        (item.quantity || 0) * (type === 'sale' ? item.unit_price : item.unit_cost)
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No hay detalles disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
