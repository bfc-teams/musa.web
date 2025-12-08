import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import { ServiceSelectionModal } from '@/components/ServiceSelectionModal';
import api from '@/services/api';
import { Plus, Trash2, Search } from 'lucide-react';

export const SalesForm = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');

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
          // Check if already exists to increment quantity? For now just append new line or user can adjust qty
          append({
            item_type: 'product',
            id: product.id,
            name: product.name,
            sku: product.sku,
            quantity: 1,
            unit_price: Number(product.sale_price),
            lot_number: ''
          });
          setBarcode('');
        } else {
          setBarcodeError('Product not found');
        }
      } catch (error) {
        console.error('Error searching product:', error);
        setBarcodeError('Error searching product');
      }
    }
  };

  const handleAddServices = (selectedServices) => {
    selectedServices.forEach(service => {
      append({
        item_type: 'service',
        id: service.id,
        name: service.name,
        quantity: 1,
        unit_price: Number(service.base_price),
        lot_number: ''
      });
    });
  };

  const onSubmit = async (data) => {
    try {
      if (data.items.length === 0) {
        alert('Please add at least one item');
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
      alert('Error creating sale');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          New Sale (POS)
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9">
            {/* General Info */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Sale Details
                </h3>
              </div>
              <div className="p-6.5">
                <SelectGroup
                  label="Warehouse"
                  name="warehouse_id"
                  register={register}
                  error={errors.warehouse_id}
                  required
                  options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                />
                <InputGroup
                  label="Customer Name"
                  name="customer_name"
                  register={register}
                  error={errors.customer_name}
                  required
                  placeholder="Walk-in Customer"
                />
                <SelectGroup
                  label="Payment Method"
                  name="payment_method"
                  register={register}
                  error={errors.payment_method}
                  required
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card' },
                    { value: 'transfer', label: 'Transfer' },
                  ]}
                />
                <InputGroup
                  label="Date"
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
                  Summary
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4 flex justify-between">
                  <span className="font-medium">Total Items:</span>
                  <span>{items.length}</span>
                </div>
                <div className="mb-4 flex justify-between text-xl font-bold text-primary">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-9 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-medium text-black dark:text-white">
              Items
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-md border border-primary py-2 px-4 text-center font-medium text-primary hover:bg-primary hover:text-white transition"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </button>
            </div>
          </div>

          <div className="p-6.5">
            {/* Barcode Input */}
            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Scan Barcode / SKU (Press Enter)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleBarcodeSubmit}
                  placeholder="Scan or type barcode..."
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
              <div className="hidden sm:flex border-b border-stroke dark:border-strokedark pb-2 mb-2 font-medium text-sm text-gray-500">
                <div className="w-1/6">Type</div>
                <div className="w-1/3">Item</div>
                <div className="w-1/6">Qty</div>
                <div className="w-1/6">Price</div>
                <div className="w-1/6 text-right">Action</div>
              </div>
            )}

            {fields.map((item, index) => {
              const currentType = items[index]?.item_type || 'product';
              return (
                <div key={item.id} className="mb-4 pb-4 border-b border-stroke dark:border-strokedark last:border-0 last:pb-0">
                  <div className="flex flex-wrap gap-4 items-center">

                    <div className="w-full sm:w-1/6">
                      <span className={`inline-block rounded px-2.5 py-0.5 text-sm font-medium ${currentType === 'product' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {currentType === 'product' ? 'Product' : 'Service'}
                      </span>
                    </div>

                    <div className="w-full sm:w-1/3">
                      <p className="text-black dark:text-white font-medium">
                        {items[index]?.name || 'Unknown Item'}
                      </p>
                      {currentType === 'product' && items[index]?.sku && (
                        <span className="text-xs text-gray-500">SKU: {items[index].sku}</span>
                      )}
                      {/* Hidden inputs to maintain form state */}
                      <input type="hidden" {...register(`items.${index}.item_type`)} />
                      <input type="hidden" {...register(`items.${index}.id`)} />
                    </div>

                    <div className="w-full sm:w-1/6">
                      <InputGroup
                        name={`items.${index}.quantity`}
                        type="number"
                        register={register}
                        required
                        placeholder="1"
                        customClasses="mb-0"
                      />
                    </div>

                    <div className="w-full sm:w-1/6">
                      <InputGroup
                        name={`items.${index}.unit_price`}
                        type="number"
                        register={register}
                        required
                        placeholder="0.00"
                        customClasses="mb-0"
                      />
                    </div>

                    <div className="w-full sm:w-1/6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded"
                        title="Remove Item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {/* Optional Lot Number for Products */}
                  {currentType === 'product' && (
                    <div className="mt-2 w-full sm:w-1/3 sm:ml-[16.66%]">
                      <input
                        {...register(`items.${index}.lot_number`)}
                        placeholder="Lot Number (Optional)"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items added. Scan a barcode or add a service.
              </div>
            )}
          </div>
        </div>
      </form>

      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onAddServices={handleAddServices}
      />
    </>
  );
};
