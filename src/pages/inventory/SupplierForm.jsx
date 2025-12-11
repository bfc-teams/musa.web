import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const SupplierForm = () => {
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
      fetchSupplier();
    }
  }, [id]);

  const fetchSupplier = async () => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      const data = response.data;
      Object.keys(data).forEach((key) => {
        setValue(key, data[key]);
      });
    } catch (error) {
      console.error('Error fetching supplier:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await api.put(`/suppliers/${id}`, data);
      } else {
        await api.post('/suppliers', data);
      }
      navigate('/inventory/suppliers');
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error al guardar el proveedor');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? 'Editar Proveedor' : 'Agregar Proveedor'}
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Detalles del Proveedor
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Nombre del Proveedor"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="Ingrese nombre del proveedor"
                customClasses="w-full xl:w-1/2"
              />
              <InputGroup
                label="Persona de Contacto"
                name="contact_info"
                register={register}
                error={errors.contact_info}
                placeholder="Ingrese nombre del contacto"
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Email"
                name="email"
                type="email"
                register={register}
                error={errors.email}
                placeholder="Ingrese email"
                customClasses="w-full xl:w-1/2"
              />
              <InputGroup
                label="Teléfono"
                name="phone"
                register={register}
                error={errors.phone}
                placeholder="Ingrese teléfono"
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Dirección"
                name="address"
                register={register}
                error={errors.address}
                placeholder="Ingrese dirección"
                customClasses="w-full xl:w-1/2"
              />
              <InputGroup
                label="RUC / NIT / Tax ID"
                name="tax_id"
                register={register}
                error={errors.tax_id}
                placeholder="Ingrese identificación fiscal"
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
