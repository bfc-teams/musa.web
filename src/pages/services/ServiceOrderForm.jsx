import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import { CustomerSelectionModal } from '@/components/CustomerSelectionModal';
import api from '@/services/api';
import { format } from 'date-fns';
import { Search, Plus, Trash2 } from 'lucide-react';
import { ServiceSelectionModal } from '@/components/ServiceSelectionModal';

export const ServiceOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id; // If id exists, it's Edit mode
  const [order, setOrder] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [globalEmployeeId, setGlobalEmployeeId] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: 'pending',
      is_courtesy: false,
    }
  });

  useEffect(() => {
    fetchDependencies();
    if (isEditMode) {
      fetchOrder();
    }
  }, [id]);

  const fetchDependencies = async () => {
    try {
      const empRes = await api.get('/employees?limit=100');
      setEmployees(empRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar dependencias:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/service-orders/${id}`);
      const data = response.data;
      setOrder(data);
      // Set form values
      setValue('status', data.status);
      setValue('remarks', data.remarks || '');
      setValue('customer_id', data.customer_id || '');
      setValue('customer_name', data.customer_name);
      setValue('is_courtesy', data.is_courtesy || false);

      // Populate Services
      if (data.OrderServices) {
        const formattedServices = data.OrderServices.map(os => ({
          ...os.Service, // Base service info (name, etc)
          id: os.service_id, // Ensure ID is Service ID for the list logic

          // Extra fields for logic
          order_service_id: os.id, // Important: Store the OrderService ID to identify existing rows
          employee_id: os.employee_id,
          base_price: os.price
        }));
        setSelectedServices(formattedServices);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Validate Services
      if (selectedServices.length === 0) {
        alert('Por favor seleccione al menos un servicio');
        return;
      }

      const items = selectedServices.map(s => ({
        id: s.order_service_id, // Undefined for new items, present for existing
        service_id: s.id,
        employee_id: s.employee_id || null,
        price: s.base_price // Send the current price (edited or default)
      }));

      const payload = {
        items,
        customer_name: data.customer_name,
        customer_id: data.customer_id,
        is_courtesy: data.is_courtesy,
        remarks: data.remarks,
        status: data.status
      };

      if (isEditMode) {
        await api.put(`/service-orders/${id}`, payload);
      } else {
        await api.post('/service-orders', payload);
      }
      navigate('/service-orders');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar la orden');
    }
  };

  if (isEditMode && !order) return <p className="p-6">Cargando...</p>;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? `Detalle de Orden: ${order.code}` : 'Nueva Orden de Servicio'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9">
            {/* Info del Cliente y Servicios */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Información del Servicio
                </h3>
              </div>

              <div className="p-6.5">
                {/* Customer Section */}
                <div className="mb-4">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Cliente <span className="text-meta-1">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      placeholder="Seleccione un cliente..."
                      {...register('customer_name', { required: true })}
                      readOnly
                    />
                    {!isEditMode && (
                      <button
                        type="button"
                        onClick={() => setCustomerModalOpen(true)}
                        className="inline-flex items-center justify-center rounded bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                      >
                        <Search className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {errors.customer_name && (
                    <span className="text-sm text-meta-1">Este campo es requerido</span>
                  )}
                  <input type="hidden" {...register('customer_id')} />

                  <CustomerSelectionModal
                    isOpen={customerModalOpen}
                    onClose={() => setCustomerModalOpen(false)}
                    onSelect={(customer) => {
                      setValue('customer_name', customer.name);
                      setValue('customer_id', customer.id);
                      setCustomerModalOpen(false);
                    }}
                  />
                </div>

                {/* Services Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-black dark:text-white">
                      Servicios <span className="text-meta-1">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setServiceModalOpen(true)}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Plus className="h-4 w-4" /> Agregar Servicios
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedServices.length === 0 && (
                      <div className="p-4 border border-dashed border-stroke rounded text-center text-gray-500">
                        No se han seleccionado servicios.
                      </div>
                    )}
                    {selectedServices.map((service, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-stroke rounded bg-gray-50 dark:bg-meta-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black dark:text-white">{service.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-24 rounded border border-stroke bg-transparent py-1 px-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:text-white"
                              value={service.base_price}
                              onChange={(e) => {
                                const newServices = [...selectedServices];
                                newServices[index].base_price = e.target.value;
                                setSelectedServices(newServices);
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-1/3">
                          <label className="text-xs mb-1 block">Estilista</label>
                          <select
                            className="w-full rounded border border-stroke bg-white py-2 px-3 outline-none dark:bg-boxdark"
                            value={service.employee_id || ''}
                            onChange={(e) => {
                              const newServices = [...selectedServices];
                              newServices[index].employee_id = e.target.value;
                              setSelectedServices(newServices);
                            }}
                          >
                            <option value="">Sin asignar</option>
                            {employees.map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedServices(selectedServices.filter((_, i) => i !== index));
                            }}
                            className="text-meta-1 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <ServiceSelectionModal
                    isOpen={serviceModalOpen}
                    onClose={() => setServiceModalOpen(false)}
                    onAddServices={(newServices) => {
                      // Apply global employee if set
                      const servicesWithEmployee = newServices.map(s => ({
                        ...s,
                        employee_id: globalEmployeeId || ''
                      }));
                      setSelectedServices([...selectedServices, ...servicesWithEmployee]);
                    }}
                  />
                </div>

                {/* <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('is_courtesy')} className="h-5 w-5" />
                    <span>Es Cortesía / Sin Cobro Inmediato</span>
                  </label>
                </div> */}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            {/* Gestión de Estado */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Gestión
                </h3>
              </div>
              <div className="p-6.5">
                <SelectGroup
                  label="Estado"
                  name="status"
                  register={register}
                  error={errors.status}
                  required
                  options={[
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'assigned', label: 'Asignado' },
                    { value: 'completed', label: 'Completado' },
                    { value: 'cancelled', label: 'Cancelado' },
                  ]}
                />

                <div className="mb-4">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Asignar Estilista a Todos (Opcional)
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={globalEmployeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setGlobalEmployeeId(empId);
                      // Update all existing selected services
                      const updated = selectedServices.map(s => ({ ...s, employee_id: empId }));
                      setSelectedServices(updated);
                    }}
                  >
                    <option value="">Seleccionar estilista...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Esto actualizará el estilista de todos los servicios seleccionados.</p>
                </div>

                <InputGroup
                  label="Notas / Observaciones"
                  name="remarks"
                  register={register}
                  placeholder="Notas adicionales..."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 mt-6"
                >
                  {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Orden' : 'Crear Orden')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
