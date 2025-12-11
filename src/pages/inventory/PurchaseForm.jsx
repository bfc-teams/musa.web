import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import { ProductSelectionModal } from '@/components/ProductSelectionModal';
import api from '@/services/api';
import { Plus, Trash2 } from 'lucide-react';

export const PurchaseForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      items: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch items to calculate total
  const items = watch('items');
  const totalCost = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
  }, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, warehousesRes] = await Promise.all([
          api.get('/suppliers?limit=100'),
          api.get('/warehouses?limit=100')
        ]);

        setSuppliers(suppliersRes.data.data || []);
        setWarehouses(warehousesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      }
    };
    fetchData();
  }, []);

  const handleAddProducts = (selectedProducts) => {
    selectedProducts.forEach(product => {
      append({
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_cost: Number(product.cost_price),
        lot_number: '',
        expiration_date: ''
      });
    });
  };

  const onSubmit = async (data) => {
    try {
      if (data.items.length === 0) {
        alert('Por favor agregue al menos un producto');
        return;
      }

      // Transform data if necessary
      const payload = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost)
        }))
      };

      await api.post('/purchases', payload);
      navigate('/inventory/purchases');
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error al registrar la compra');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Nueva Compra
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9">
            {/* General Info */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Información General
                </h3>
              </div>
              <div className="p-6.5">
                <SelectGroup
                  label="Proveedor"
                  name="supplier_id"
                  register={register}
                  error={errors.supplier_id}
                  required
                  options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                />
                <SelectGroup
                  label="Almacén"
                  name="warehouse_id"
                  register={register}
                  error={errors.warehouse_id}
                  required
                  options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                />
                <InputGroup
                  label="Fecha"
                  name="date"
                  type="date"
                  register={register}
                  error={errors.date}
                  required
                />
                <InputGroup
                  label="Número de Factura"
                  name="invoice_number"
                  register={register}
                  error={errors.invoice_number}
                  placeholder="INV-001"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            {/* Summary */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Resumen
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4 flex justify-between">
                  <span className="font-medium">Total Ítems:</span>
                  <span>{items.length}</span>
                </div>
                <div className="mb-4 flex justify-between text-xl font-bold text-primary">
                  <span>Costo Total:</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  {isSubmitting ? 'Procesando...' : 'Registrar Compra'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-9 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">
              Ítems
            </h3>
            <button
              type="button"
              onClick={() => setIsProductModalOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              <Plus className="h-4 w-4" />
              Agregar Productos
            </button>
          </div>
          <div className="p-6.5">
            {fields.length > 0 && (
              <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-stroke dark:border-strokedark pb-2 mb-2 font-medium text-sm text-gray-500">
                <div className="col-span-12 sm:col-span-3">Producto</div>
                <div className="col-span-6 sm:col-span-2">Cantidad</div>
                <div className="col-span-6 sm:col-span-2">Costo Unit.</div>
                <div className="col-span-6 sm:col-span-2">Lote</div>
                <div className="col-span-6 sm:col-span-2">Vencimiento</div>
                <div className="col-span-12 sm:col-span-1 text-right">Acción</div>
              </div>
            )}

            {fields.map((item, index) => (
              <div key={item.id} className="mb-4 pb-4 border-b border-stroke dark:border-strokedark last:border-0 last:pb-0">
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-12 sm:col-span-3">
                    <p className="text-black dark:text-white font-medium">
                      {items[index]?.name || 'Producto Desconocido'}
                    </p>
                    {items[index]?.sku && (
                      <span className="text-xs text-gray-500 block">SKU: {items[index].sku}</span>
                    )}
                    <input type="hidden" {...register(`items.${index}.product_id`)} />
                  </div>

                  <div className="col-span-6 sm:col-span-2 relative">
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`, { required: true })}
                      placeholder="1"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2 relative">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_cost`, { required: true })}
                      placeholder="0.00"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2 relative">
                    <input
                      type="text"
                      {...register(`items.${index}.lot_number`)}
                      placeholder="Lote"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2 relative">
                    <input
                      type="date"
                      {...register(`items.${index}.expiration_date`)}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay productos agregados. Haga clic en "Agregar Productos" para comenzar.
              </div>
            )}
          </div>
        </div>
      </form>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProducts={handleAddProducts}
      />
    </>
  );
};
