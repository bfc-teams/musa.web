import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchService();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?fetchAll=true');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      const data = response.data;
      setValue('name', data.name || '');
      setValue('description', data.description || '');
      setValue('category_id', data.category_id || '');
      setValue('duration_minutes', data.duration_minutes || '');
      setValue('base_price', data.base_price || '');
      setValue('default_commission_percent', data.default_commission_percent || '');
    } catch (error) {
      console.error('Error fetching service:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        category_id: data.category_id || null,
      };

      if (isEditMode) {
        await api.put(`/services/${id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      navigate('/services');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error al guardar el servicio');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Detalles del Servicio
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Nombre del Servicio"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="Ingresa el nombre del servicio"
                customClasses="w-full xl:w-1/2"
              />
              <SelectGroup
                label="Categoria"
                name="category_id"
                register={register}
                error={errors.category_id}
                required
                placeholder="Seleccionar categoria"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Descripcion
              </label>
              <textarea
                rows={4}
                placeholder="Ingresa la descripcion del servicio"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                {...register('description')}
              ></textarea>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Duracion (minutos)"
                name="duration_minutes"
                type="number"
                register={register}
                error={errors.duration_minutes}
                required
                placeholder="Ej. 30"
                customClasses="w-full xl:w-1/3"
              />
              <InputGroup
                label="Precio Base"
                name="base_price"
                type="number"
                register={register}
                error={errors.base_price}
                required
                placeholder="0.00"
                customClasses="w-full xl:w-1/3"
              />
              <InputGroup
                label="Comision (%)"
                name="default_commission_percent"
                type="number"
                register={register}
                error={errors.default_commission_percent}
                placeholder="0"
                customClasses="w-full xl:w-1/3"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
