import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import api from '@/services/api';
import { Plus, Trash2, Search } from 'lucide-react';
import { ProductSelectionModal } from '@/components/ProductSelectionModal';
import { formatCurrency } from '@/utils/formatUtils';
import { CustomerSelectionModal } from '@/components/CustomerSelectionModal';

export const SalesForm = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [barcodeError, setBarcodeError] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const handleSelectCustomer = (customer) => {
    setValue('customer_name', customer.name);
    setIsCustomerModalOpen(false);
  };

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
      payment_method: 'cash',
      items: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch items to calculate total
  const items = watch('items');
  const totalAmount = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
  }, 0);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/warehouses?limit=100');
        setWarehouses(response.data.data || []);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
      }
    };
    fetchWarehouses();
  }, []);

  const handleBarcodeSubmit = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!barcode.trim()) return;

      setBarcodeError('');
      try {
        // Try to find by barcode first, then SKU
        let response = await api.get(`/products?barcode=${barcode}`);
        let products = response.data.data || [];

        if (products.length === 0) {
          // Fallback to SKU if no barcode match
          response = await api.get(`/products?sku=${barcode}`);
          products = response.data.data || [];
        }

        if (products.length > 0) {
          const product = products[0];
          addProductToSale(product);
          setBarcode('');
        } else {
          setBarcodeError('Producto no encontrado');
        }
      } catch (error) {
        console.error('Error searching product:', error);
        setBarcodeError('Error buscando producto');
      }
    }
  };

  const addProductToSale = (product) => {
    append({
      item_type: 'product',
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: 1,
      unit_price: Number(product.sale_price),
      lot_number: ''
    });
  };

  const handleAddProductsFromModal = (products) => {
    products.forEach(product => addProductToSale(product));
  };

  const onSubmit = async (data) => {
    try {
      if (data.items.length === 0) {
        alert('Por favor agregue al menos un artículo');
        return;
      }

      const payload = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          id: Number(item.id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        }))
      };

      await api.post('/sales', payload);
      navigate('/sales');
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al crear la venta');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Nueva Venta (POS)
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9">
            {/* General Info */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Detalles de la Venta
                </h3>
              </div>
              <div className="p-6.5">
                <SelectGroup
                  label="Almacén"
                  name="warehouse_id"
                  register={register}
                  error={errors.warehouse_id}
                  required
                  options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                />
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Cliente <span className="text-gray-400 text-sm">(Opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        {...register('customer_name')}
                        placeholder="Nombre del Cliente (Opcional)"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white hover:bg-opacity-90"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                <CustomerSelectionModal
                  isOpen={isCustomerModalOpen}
                  onClose={() => setIsCustomerModalOpen(false)}
                  onSelect={handleSelectCustomer}
                />
                <SelectGroup
                  label="Método de Pago"
                  name="payment_method"
                  register={register}
                  error={errors.payment_method}
                  required
                  options={[
                    { value: 'cash', label: 'Efectivo' },
                    { value: 'card', label: 'Tarjeta' },
                    { value: 'transfer', label: 'Transferencia' },
                  ]}
                />
                <InputGroup
                  label="Fecha"
                  name="date"
                  type="date"
                  register={register}
                  error={errors.date}
                  required
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
                  <span className="font-medium">Total de Artículos:</span>
                  <span>{items.length}</span>
                </div>
                <div className="mb-4 flex justify-between text-xl font-bold text-primary">
                  <span>Monto Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  {isSubmitting ? 'Procesando...' : 'Completar Venta'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-9 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-medium text-black dark:text-white">
              Artículos
            </h3>
            <button
              type="button"
              onClick={() => setIsProductModalOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
            >
              <Search className="h-5 w-5" />
              Buscar Productos
            </button>
          </div>

          <div className="p-6.5">
            {/* Barcode Input */}
            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Escanear Código de Barras / SKU (Presione Enter)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleBarcodeSubmit}
                  placeholder="Escanee o escriba código de barras..."
                  className={`w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${barcodeError ? 'border-danger focus:border-danger' : ''}`}
                  autoFocus
                />
                <span className="absolute right-4 top-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </span>
              </div>
              {barcodeError && <p className="mt-1 text-sm text-danger">{barcodeError}</p>}
            </div>

            {/* Items Table Header */}
            {fields.length > 0 && (
              <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-stroke dark:border-strokedark pb-2 mb-2 font-medium text-sm text-gray-500">
                <div className="hidden sm:block col-span-2 md:col-span-2">SKU</div>
                <div className="col-span-12 sm:col-span-4 md:col-span-3">Artículo</div>
                <div className="col-span-6 sm:col-span-2 md:col-span-2">Cant.</div>
                <div className="col-span-6 sm:col-span-2 md:col-span-2">Precio</div>
                <div className="col-span-12 sm:col-span-2 md:col-span-3 text-right">Acción</div>
              </div>
            )}

            {fields.map((item, index) => {
              return (
                <div key={item.id} className="mb-4 pb-4 border-b border-stroke dark:border-strokedark last:border-0 last:pb-0">
                  <div className="grid grid-cols-12 gap-4 items-center">

                    <div className="hidden sm:block col-span-2 md:col-span-2">
                      <p className="text-sm text-black dark:text-white">
                        {items[index]?.sku || '-'}
                      </p>
                    </div>

                    <div className="col-span-12 sm:col-span-4 md:col-span-3">
                      <p className="text-black dark:text-white font-medium">
                        {items[index]?.name || 'Artículo Desconocido'}
                      </p>
                      {/* Show SKU here only on mobile */}
                      <span className="sm:hidden text-xs text-gray-500 block">SKU: {items[index]?.sku || '-'}</span>

                      {/* Hidden inputs to maintain form state */}
                      <input type="hidden" {...register(`items.${index}.item_type`)} />
                      <input type="hidden" {...register(`items.${index}.id`)} />
                    </div>

                    <div className="col-span-6 sm:col-span-2 md:col-span-2 relative">
                      {/* Custom Input without InputGroup label/margin overhead for table */}
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`, { required: true })}
                        placeholder="1"
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white ${errors.items?.[index]?.quantity ? 'border-danger' : ''}`}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2 md:col-span-2">
                      <input
                        type="number"
                        {...register(`items.${index}.unit_price`, { required: true })}
                        placeholder="0.00"
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white ${errors.items?.[index]?.unit_price ? 'border-danger' : ''}`}
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-2 md:col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded"
                        title="Eliminar Artículo"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay artículos agregados. Escanee un código de barras o busque productos.
              </div>
            )}
          </div>
        </div>
      </form>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProducts={handleAddProductsFromModal}
        warehouseId={watch('warehouse_id')}
      />
    </>
  );
};
