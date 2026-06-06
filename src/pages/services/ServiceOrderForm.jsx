import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import { CustomerSelectionModal } from '@/components/CustomerSelectionModal';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { Search, Plus, Trash2 } from 'lucide-react';
import { ServiceSelectionModal } from '@/components/ServiceSelectionModal';

const ITEM_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'assigned', label: 'Asignado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const EMPLOYEE_ITEM_STATUS_OPTIONS = [
  { value: 'assigned', label: 'Asignado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const ServiceOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const currentUser = useAuthStore((state) => state.user);
  const isEmployeeUser = currentUser?.role === 'employee';
  const currentEmployeeId = Number(currentUser?.employee_id || 0);

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

  const employeeOwnedServices = useMemo(
    () => selectedServices.filter((service) => Number(service.employee_id) === currentEmployeeId),
    [currentEmployeeId, selectedServices]
  );

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
      setValue('status', data.status);
      setValue('remarks', data.remarks || '');
      setValue('customer_id', data.customer_id || '');
      setValue('customer_name', data.customer_name);
      setValue('is_courtesy', data.is_courtesy || false);

      if (data.OrderServices) {
        const formattedServices = data.OrderServices.map((orderService) => ({
          ...orderService.Service,
          id: orderService.service_id,
          order_service_id: orderService.id,
          employee_id: orderService.employee_id,
          base_price: orderService.price,
          item_status: orderService.status || (orderService.employee_id ? 'assigned' : 'pending'),
          observation: orderService.observation || '',
          employee_name: orderService.Employee?.name || '',
        }));
        setSelectedServices(formattedServices);
      }
    } catch (error) {
      console.error('Error al cargar la orden:', error);
    }
  };

  const canEditServiceAssignment = (service) => !isEmployeeUser || Number(service.employee_id) === currentEmployeeId;

  const updateSelectedService = (index, patch) => {
    setSelectedServices((previous) =>
      previous.map((service, serviceIndex) => (
        serviceIndex === index
          ? { ...service, ...patch }
          : service
      ))
    );
  };

  const onSubmit = async (data) => {
    try {
      if (selectedServices.length === 0) {
        alert('Por favor seleccione al menos un servicio');
        return;
      }

      if (isEmployeeUser) {
        if (!isEditMode) {
          alert('Los empleados solo pueden actualizar servicios asignados.');
          return;
        }

        const items = employeeOwnedServices
          .filter((service) => service.order_service_id)
          .map((service) => ({
            id: service.order_service_id,
            status: service.item_status,
            observation: service.observation || '',
          }));

        if (items.length === 0) {
          alert('No tienes servicios asignados en esta orden.');
          return;
        }

        await api.put(`/service-orders/${id}`, { items });
        navigate('/service-orders');
        return;
      }

      const items = selectedServices.map((service) => ({
        id: service.order_service_id,
        service_id: service.id,
        employee_id: service.employee_id || null,
        price: service.base_price,
        status: service.item_status,
        observation: service.observation || '',
      }));

      const payload = {
        items,
        customer_name: data.customer_name,
        customer_id: data.customer_id,
        is_courtesy: data.is_courtesy,
        remarks: data.remarks,
        status: data.status,
      };

      if (isEditMode) {
        await api.put(`/service-orders/${id}`, payload);
      } else {
        await api.post('/service-orders', payload);
      }

      navigate('/service-orders');
    } catch (error) {
      console.error('Error al guardar la orden:', error);
      alert('Error al guardar la orden');
    }
  };

  if (isEditMode && !order) {
    return <p className="p-6">Cargando...</p>;
  }

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
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Informacion del Servicio
                </h3>
              </div>

              <div className="p-6.5">
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
                    {!isEditMode && !isEmployeeUser && (
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

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-black dark:text-white">
                      Servicios <span className="text-meta-1">*</span>
                    </label>
                    {!isEmployeeUser && (
                      <button
                        type="button"
                        onClick={() => setServiceModalOpen(true)}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Plus className="h-4 w-4" /> Agregar Servicios
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedServices.length === 0 && (
                      <div className="rounded border border-dashed border-stroke p-4 text-center text-gray-500">
                        No se han seleccionado servicios.
                      </div>
                    )}

                    {selectedServices.map((service, index) => {
                      const editableByEmployee = canEditServiceAssignment(service);
                      const itemStatusOptions = isEmployeeUser ? EMPLOYEE_ITEM_STATUS_OPTIONS : ITEM_STATUS_OPTIONS;

                      return (
                        <div key={`${service.order_service_id || service.id}-${index}`} className="rounded border border-stroke bg-gray-50 p-4 dark:bg-meta-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-black dark:text-white">{service.name}</h4>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-gray-500">Bs.</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-28 rounded border border-stroke bg-transparent py-1 px-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:text-white"
                                  value={service.base_price}
                                  onChange={(e) => updateSelectedService(index, { base_price: e.target.value })}
                                  disabled={isEmployeeUser}
                                />
                              </div>
                            </div>

                            <div className="grid flex-[2] grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                                  Estilista
                                </label>
                                <select
                                  className="w-full rounded border border-stroke bg-white py-2 px-3 outline-none dark:bg-boxdark"
                                  value={service.employee_id || ''}
                                  onChange={(e) => {
                                    const employeeId = e.target.value;
                                    const nextStatus = employeeId
                                      ? (service.item_status === 'pending' ? 'assigned' : service.item_status)
                                      : 'pending';

                                    updateSelectedService(index, {
                                      employee_id: employeeId,
                                      item_status: nextStatus,
                                    });
                                  }}
                                  disabled={isEmployeeUser}
                                >
                                  <option value="">Sin asignar</option>
                                  {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                                  Estado del servicio
                                </label>
                                <select
                                  className="w-full rounded border border-stroke bg-white py-2 px-3 outline-none dark:bg-boxdark"
                                  value={service.item_status || ''}
                                  onChange={(e) => updateSelectedService(index, { item_status: e.target.value })}
                                  disabled={isEmployeeUser && !editableByEmployee}
                                >
                                  {itemStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {!isEmployeeUser && (
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedServices((previous) => previous.filter((_, serviceIndex) => serviceIndex !== index));
                                  }}
                                  className="text-meta-1 hover:text-red-700"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-4">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                              Observacion del servicio
                            </label>
                            <textarea
                              rows={3}
                              className="w-full rounded border border-stroke bg-white py-2 px-3 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                              placeholder={isEmployeeUser ? 'Agrega una observacion del servicio realizado o cancelado' : 'Observaciones internas del servicio'}
                              value={service.observation || ''}
                              onChange={(e) => updateSelectedService(index, { observation: e.target.value })}
                              disabled={isEmployeeUser && !editableByEmployee}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ServiceSelectionModal
                    isOpen={serviceModalOpen}
                    onClose={() => setServiceModalOpen(false)}
                    onAddServices={(newServices) => {
                      const servicesWithEmployee = newServices.map((service) => ({
                        ...service,
                        employee_id: globalEmployeeId || '',
                        item_status: globalEmployeeId ? 'assigned' : 'pending',
                        observation: '',
                      }));

                      setSelectedServices((previous) => [...previous, ...servicesWithEmployee]);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Gestion
                </h3>
              </div>
              <div className="p-6.5">
                <SelectGroup
                  label="Estado de la orden"
                  name="status"
                  register={register}
                  error={errors.status}
                  required
                  options={[
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'assigned', label: 'Asignado' },
                    { value: 'in_progress', label: 'En progreso' },
                    { value: 'completed', label: 'Completado' },
                    { value: 'cancelled', label: 'Cancelado' },
                  ]}
                  disabled={isEmployeeUser}
                />

                {!isEmployeeUser && (
                  <div className="mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Asignar Estilista a Todos (Opcional)
                    </label>
                    <select
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={globalEmployeeId}
                      onChange={(e) => {
                        const employeeId = e.target.value;
                        setGlobalEmployeeId(employeeId);
                        setSelectedServices((previous) => previous.map((service) => ({
                          ...service,
                          employee_id: employeeId,
                          item_status: employeeId
                            ? (service.item_status === 'pending' ? 'assigned' : service.item_status)
                            : 'pending',
                        })));
                      }}
                    >
                      <option value="">Seleccionar estilista...</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>{employee.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Esto actualizara el estilista de todos los servicios seleccionados.
                    </p>
                  </div>
                )}

                <InputGroup
                  label="Notas / Observaciones de la orden"
                  name="remarks"
                  register={register}
                  placeholder="Notas adicionales..."
                  disabled={isEmployeeUser}
                />

                {isEmployeeUser && (
                  <p className="mt-4 rounded border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                    Solo puedes actualizar el estado y la observacion de los servicios asignados a tu usuario.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : isEmployeeUser
                      ? 'Guardar actualizacion'
                      : (isEditMode ? 'Actualizar Orden' : 'Crear Orden')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
