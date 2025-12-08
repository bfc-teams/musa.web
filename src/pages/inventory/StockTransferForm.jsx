import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const StockTransferForm = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [availableStock, setAvailableStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      source_warehouse_id: '',
      destination_warehouse_id: '',
      quantity: '',
    }
  });

  const sourceWarehouseId = watch('source_warehouse_id');
  const selectedStockId = watch('stock_id'); // Temporary field to select product+lot

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (sourceWarehouseId) {
      fetchWarehouseStock(sourceWarehouseId);
      setValue('stock_id', ''); // Reset selection on warehouse change
      setValue('product_id', '');
      setValue('lot_number', '');
      setSearchTerm('');
    } else {
      setAvailableStock([]);
    }
  }, [sourceWarehouseId, setValue]);

  const filteredStock = availableStock.filter(stock =>
    stock.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockSelect = (stock) => {
    setValue('stock_id', stock.id.toString());
    setValue('product_id', stock.product_id);
    setValue('lot_number', stock.lot_number);
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses?fetchAll=true');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchWarehouseStock = async (warehouseId) => {
    setLoadingStock(true);
    try {
      const response = await api.get(`/warehouses/${warehouseId}/stock?fetchAll=true`);
      setAvailableStock(response.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Prepare payload matches backend expectation
      const payload = {
        source_warehouse_id: data.source_warehouse_id,
        destination_warehouse_id: data.destination_warehouse_id,
        product_id: data.product_id,
        lot_number: data.lot_number,
        quantity: Number(data.quantity),
      };

      await api.post('/transfers', payload);
      alert('Stock transferido exitosamente');
      navigate('/inventory/stock'); // Or wherever appropriate
    } catch (error) {
      console.error('Error transferring stock:', error);
      alert(error.response?.data?.message || 'Error al transferir stock');
    }
  };

  // Filter destination warehouses to exclude source
  const destinationOptions = warehouses
    .filter(w => w.id.toString() !== sourceWarehouseId)
    .map(w => ({ value: w.id, label: w.name }));

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Nueva Transferencia de Stock
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Detalles de la Transferencia
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <SelectGroup
                label="Almacén Origen"
                name="source_warehouse_id"
                register={register}
                error={errors.source_warehouse_id}
                required
                options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                customClasses="w-full xl:w-1/2"
              />
              <SelectGroup
                label="Almacén Destino"
                name="destination_warehouse_id"
                register={register}
                error={errors.destination_warehouse_id}
                required
                options={destinationOptions}
                customClasses="w-full xl:w-1/2"
                disabled={!sourceWarehouseId}
              />
            </div>

            {sourceWarehouseId && (
              <div className="mb-6">
                <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                  Seleccionar Producto a Transferir
                </h4>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto rounded border border-stroke dark:border-strokedark">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-2 dark:bg-meta-4">
                      <tr>
                        <th className="p-2 font-medium text-black dark:text-white">Producto</th>
                        <th className="p-2 font-medium text-black dark:text-white">Lote</th>
                        <th className="p-2 font-medium text-black dark:text-white">Cant. Disponible</th>
                        <th className="p-2 font-medium text-black dark:text-white">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStock.length > 0 ? (
                        filteredStock.map((stock) => (
                          <tr
                            key={stock.id}
                            className={`border-b border-stroke last:border-b-0 dark:border-strokedark ${selectedStockId === stock.id.toString() ? 'bg-primary/10' : ''}`}
                          >
                            <td className="p-2">{stock.Product?.name}</td>
                            <td className="p-2">{stock.lot_number}</td>
                            <td className="p-2">{stock.quantity}</td>
                            <td className="p-2">
                              <button
                                type="button"
                                onClick={() => handleStockSelect(stock)}
                                className={`rounded px-3 py-1 text-xs font-medium ${selectedStockId === stock.id.toString()
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-black hover:bg-gray-300 dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-80'
                                  }`}
                              >
                                {selectedStockId === stock.id.toString() ? 'Seleccionado' : 'Seleccionar'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-gray-500">
                            {loadingStock ? 'Cargando stock...' : 'No se encontraron productos'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {errors.stock_id && (
                  <p className="mt-1 text-xs text-danger">Por favor seleccione un producto de la lista</p>
                )}
              </div>
            )}

            <div className="mb-4.5">
              <InputGroup
                label="Cantidad a Transferir"
                name="quantity"
                type="number"
                register={register}
                error={errors.quantity}
                required
                placeholder="Ingrese cantidad"
                customClasses="w-full xl:w-1/2"
                min={1}
              />
            </div>

            {/* Hidden fields to store derived values */}
            <input type="hidden" {...register('product_id')} />
            <input type="hidden" {...register('lot_number')} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isSubmitting ? 'Procesando...' : 'Transferir Stock'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
