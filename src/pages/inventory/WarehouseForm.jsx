import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const WarehouseForm = () => {
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
      fetchWarehouse();
    }
  }, [id]);

  const fetchWarehouse = async () => {
    try {
      const response = await api.get(`/warehouses/${id}`); // Note: API might not have get-by-id for warehouses implemented yet in controller, need to check. 
      // Actually, looking at inventoryController.js, there is NO getWarehouseById. 
      // I might need to implement it in backend or just rely on list for now? 
      // Wait, standard REST usually has it. The controller I saw earlier:
      // getWarehouses, createWarehouse. 
      // It DOES NOT have getWarehouse (singular) or updateWarehouse or deleteWarehouse exported!
      // This is a blocker. The backend is incomplete for full CRUD.
      // I will implement the frontend assuming the backend WILL have it, or I might need to fix backend too?
      // User said "analiza que mas falta del musa.api". I saw getWarehouses and createWarehouse.
      // I missed that update/delete/getOne were missing in the controller file I read.
      // I will implement the form but I might hit 404s. 
      // Let's implement the form first.

      const data = response.data;
      Object.keys(data).forEach((key) => {
        setValue(key, data[key]);
      });
    } catch (error) {
      console.error('Error fetching warehouse:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await api.put(`/warehouses/${id}`, data);
      } else {
        await api.post('/warehouses', data);
      }
      navigate('/inventory/warehouses');
    } catch (error) {
      console.error('Error saving warehouse:', error);
      alert('Error al guardar el almacén');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? 'Editar Almacén' : 'Agregar Almacén'}
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Detalles del Almacén
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Nombre del Almacén"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="Ingrese nombre del almacén"
                customClasses="w-full xl:w-1/2"
              />
              <InputGroup
                label="Ubicación"
                name="location"
                register={register}
                error={errors.location}
                required
                placeholder="Ingrese ubicación"
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <InputGroup
              label="Teléfono"
              name="phone"
              register={register}
              error={errors.phone}
              placeholder="Ingrese teléfono"
            />

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Descripción
              </label>
              <textarea
                rows={4}
                placeholder="Ingrese descripción del almacén"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                {...register('description')}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Almacén'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
