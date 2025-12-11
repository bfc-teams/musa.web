import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const EmployeeForm = () => {
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
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      const data = response.data;
      // Set form values
      Object.keys(data).forEach((key) => {
        setValue(key, data[key]);
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await api.put(`/employees/${id}`, data);
      } else {
        await api.post('/employees', data);
      }
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? 'Editar Empleado' : 'Agregar Empleado'}
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Detalles del Empleado
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Nombre Completo"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="Ingrese nombre completo"
                customClasses="w-full xl:w-1/2"
              />
              <InputGroup
                label="Email"
                name="email"
                type="email"
                register={register}
                error={errors.email}
                required
                placeholder="Ingrese correo electrónico"
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Teléfono"
                name="phone"
                register={register}
                error={errors.phone}
                placeholder="Ingrese número telefónico"
                customClasses="w-full xl:w-1/2"
              />
              <InputGroup
                label="Fecha de Contratación"
                name="hire_date"
                type="date"
                register={register}
                error={errors.hire_date}
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <div className="mb-4.5">
              <SelectGroup
                label="Rol"
                name="role"
                register={register}
                error={errors.role}
                required
                options={[
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'STYLIST', label: 'Estilista' },
                  { value: 'RECEPTIONIST', label: 'Recepcionista' },
                ]}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
