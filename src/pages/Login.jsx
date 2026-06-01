import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export function Login() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(60,80,224,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(128,202,238,0.20),_transparent_30%)]" />
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_40px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-strokedark dark:bg-boxdark/90">
        <div className="w-full p-6 sm:p-10 xl:p-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-bodydark2">
              MUSA
            </p>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-bodydark2">
              Bienvenido
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Iniciar sesion
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-bodydark1">
              Ingresa con tus credenciales para continuar con la operacion diaria.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl bg-danger/10 p-4 text-sm text-danger">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white">
                  Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ingresa tu usuario"
                    {...register('username')}
                    className="w-full rounded-2xl border border-slate-200 bg-white/70 py-4 pl-5 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <span className="absolute right-4 top-4 text-slate-400">
                    <Mail className="h-5 w-5 opacity-50" />
                  </span>
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-danger">{errors.username.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white">
                  Contrasena
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Ingresa tu contrasena"
                    {...register('password')}
                    className="w-full rounded-2xl border border-slate-200 bg-white/70 py-4 pl-5 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <span className="absolute right-4 top-4 text-slate-400">
                    <Lock className="h-5 w-5 opacity-50" />
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
                )}
              </div>

              <div className="mb-5 pt-2">
                <input
                  type="submit"
                  value={isLoading ? 'Iniciando sesion...' : 'Entrar al sistema'}
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-2xl border border-primary bg-primary p-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
