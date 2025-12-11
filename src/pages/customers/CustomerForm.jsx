import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isEditMode) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      const data = response.data;
      // Set form values
      setValue('name', data.name);
      setValue('documentIdentification', data.documentIdentification || '');
      setValue('email', data.email || '');
      setValue('phone', data.phone || '');
      setValue('address', data.address || '');
      setValue('city', data.city || '');
      setValue('notes', data.notes || '');
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Error al cargar cliente');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await api.put(`/customers/${id}`, data);
      } else {
        await api.post('/customers', data);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar cliente');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Información del Cliente
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <InputGroup
                  label="Nombre Completo"
                  name="name"
                  register={register}
                  error={errors.name}
                  required
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="w-full xl:w-1/2">
                <InputGroup
                  label="Email"
                  name="email"
                  type="email"
                  register={register}
                  error={errors.email}
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <InputGroup
                  label="RUT / DNI / Pasaporte"
                  name="documentIdentification"
                  register={register}
                  error={errors.documentIdentification}
                  placeholder="Ej. 12.345.678-9"
                />
              </div>

            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <InputGroup
                  label="Teléfono"
                  name="phone"
                  register={register}
                  error={errors.phone}
                  placeholder="Ej. 0987654321"
                />
              </div>
              <div className="w-full xl:w-1/2">
                <InputGroup
                  label="Ciudad"
                  name="city"
                  register={register}
                  error={errors.city}
                  placeholder="Ej. Santiago"
                />
              </div>
            </div>

            <InputGroup
              label="Dirección"
              name="address"
              register={register}
              error={errors.address}
              placeholder="Dirección completa"
              className="mb-4.5"
            />

            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Notas
              </label>
              <textarea
                rows={4}
                placeholder="Notas adicionales sobre el cliente"
                {...register('notes')}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Cliente' : 'Crear Cliente')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
