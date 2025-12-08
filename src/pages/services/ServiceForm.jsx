import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup, SelectGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const ServiceForm = () => {
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
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      const data = response.data;
      Object.keys(data).forEach((key) => {
        setValue(key, data[key]);
      });
    } catch (error) {
      console.error('Error fetching service:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await api.put(`/services/${id}`, data);
      } else {
        await api.post('/services', data);
      }
      navigate('/services');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {isEditMode ? 'Edit Service' : 'Add Service'}
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Service Details
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Service Name"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="Enter service name"
                customClasses="w-full xl:w-1/2"
              />
              <SelectGroup
                label="Category"
                name="category"
                register={register}
                error={errors.category}
                required
                options={[
                  { value: 'Hair', label: 'Hair' },
                  { value: 'Nails', label: 'Nails' },
                  { value: 'Skin', label: 'Skin' },
                  { value: 'Massage', label: 'Massage' },
                  { value: 'Other', label: 'Other' },
                ]}
                customClasses="w-full xl:w-1/2"
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter service description"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                {...register('description')}
              ></textarea>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <InputGroup
                label="Duration (minutes)"
                name="duration_minutes"
                type="number"
                register={register}
                error={errors.duration_minutes}
                required
                placeholder="30"
                customClasses="w-full xl:w-1/3"
              />
              <InputGroup
                label="Base Price"
                name="base_price"
                type="number"
                register={register}
                error={errors.base_price}
                required
                placeholder="0.00"
                customClasses="w-full xl:w-1/3"
              />
              <InputGroup
                label="Commission (%)"
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
              {isSubmitting ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
