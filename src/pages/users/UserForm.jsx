import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data || res.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const user = response.data;
      reset({
        username: user.username,
        email: user.email,
        role: user.role,
        role_id: user.role_id,
        employee_id: user.employee_id,
        status: user.status,
        password: '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        role_id: data.role_id || null,
        employee_id: data.employee_id || null,
      };

      if (payload.role_id) {
        const selectedRole = roles.find((role) => role.id === Number(payload.role_id));
        if (selectedRole) {
          const normalizedRoleName = selectedRole.name.toLowerCase();
          payload.role = normalizedRoleName.includes('admin')
            ? 'admin'
            : normalizedRoleName.includes('recep')
              ? 'reception'
              : 'employee';
        }
      }

      if (id) {
        if (!payload.password) delete payload.password;
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar usuario. Verifique el nombre de usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          {id ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <InputGroup
              label="Nombre de Usuario"
              name="username"
              register={register}
              required
              placeholder="Ingresa nombre de usuario"
              error={errors.username}
              autoComplete="off"
              width="w-full xl:w-1/2"
            />
            <InputGroup
              label="Email"
              name="email"
              type="email"
              register={register}
              placeholder="Ingresa email"
              autoComplete="off"
              width="w-full xl:w-1/2"
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <InputGroup
              label={id ? 'Contrasena (Dejar en blanco para mantener)' : 'Contrasena'}
              name="password"
              type="password"
              register={register}
              required={!id}
              placeholder="Ingresa contrasena"
              autoComplete="new-password"
              width="w-full xl:w-1/2"
            />

            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Rol
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  {...register('role_id', { required: 'Este campo es requerido' })}
                  autoComplete="off"
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="">Seleccionar Rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Empleado Asociado
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  {...register('employee_id')}
                  autoComplete="off"
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="">Seleccionar Empleado (Opcional)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Estado
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  {...register('status')}
                  autoComplete="off"
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};
