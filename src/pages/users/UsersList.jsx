import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import api from '@/services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const columns = [
    { header: 'Usuario', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: 'role', render: (row) => <span className="capitalize">{row.role}</span> },
    { header: 'Empleado', accessor: 'Employee.name', render: (row) => row.Employee?.name || 'N/A' },
    {
      header: 'Estado', accessor: 'status', render: (row) => (
        <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${row.status === 'active' ? 'bg-success text-success' : 'bg-danger text-danger'
          }`}>
          {row.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  const actions = (row) => (
    <div className="flex items-center space-x-3.5">
      <Link
        to={`/users/${row.id}/edit`}
        className="hover:text-primary"
        title="Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
      <button
        onClick={() => handleDelete(row.id)}
        className="hover:text-danger"
        title="Eliminar"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Usuarios
        </h2>
        <Link
          to="/users/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Nuevo Usuario
        </Link>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table columns={columns} data={users} actions={actions} />
      )}
    </>
  );
};
