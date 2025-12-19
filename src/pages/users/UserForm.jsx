import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputGroup } from '@/components/ui/FormElements';
import api from '@/services/api';

export const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [activeTab, setActiveTab] = useState('general');
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
      const res = await api.get('/employees'); // Assuming this returns { data: [...] } or [...]
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
        role: user.role, // Legacy role string
        role_id: user.role_id, // New role ID
        employee_id: user.employee_id,
        status: user.status
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {

      // Ensure 'role' string is set based on role_id if available, for backward compatibility
      if (data.role_id) {
        const selectedRole = roles.find(r => r.id === parseInt(data.role_id));
        if (selectedRole) {
          // You might map role name to slug if needed, but for now using name or a simplified slug
          // The backend seems to use 'admin', 'reception', 'employee' slugs in the ENUM.
          // Role names in seed are 'Admin', 'Manager', 'Employee', 'Receptionist'.
          // We might need to map them or just send the name lowercased? 
          // Let's assume sending role_id is enough for new logic, but if backend CREATE expects 'role' enum...
          // The backend controller takes `role` and `role_id`.
          // If I send `role: selectedRole.name.toLowerCase()` it might match enum if simplistic.
          // But safer to just pass role_id and let backend handle or user selecting it if we keep the field hidden?
          // User asked to load select from DB. 
          // I will use role_id as the primary value for the select.
          // And inject 'role_id' into data.
          // data.role is what the form registers. I should register 'role_id' instead in the select.
          // Let's change the select name to 'role_id'.
        }
      }

      if (id) {
        // Update (password is optional)
        if (!data.password) delete data.password;
        await api.put(`/users/${id}`, data);
      } else {
        // Create
        await api.post('/users', data);
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <InputGroup
              label="Nombre de Usuario"
              name="username"
              register={register}
              required
              placeholder="Ingresa nombre de usuario"
              error={errors.username}
              width="w-full xl:w-1/2"
            />
            <InputGroup
              label="Email"
              name="email"
              type="email"
              register={register}
              placeholder="Ingresa email"
              width="w-full xl:w-1/2"
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <InputGroup
              label={id ? "Contraseña (Dejar en blanco para mantener)" : "Contraseña"}
              name="password"
              type="password"
              register={register}
              required={!id}
              placeholder="Ingresa contraseña"
              width="w-full xl:w-1/2"
            />

            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Rol
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  {...register('role_id', { required: 'Este campo es requerido' })}
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
