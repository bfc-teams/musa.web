import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
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
      console.error("Login failed", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-boxdark-2">
      <div className="w-full max-w-125 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="/">
                <h1 className="text-4xl font-bold text-primary dark:text-white">MUSA</h1>
              </Link>
              <p className="2xl:px-20 text-body">
                Sistema de gestión de salones de belleza
              </p>
              <span className="mt-15 inline-block">
                {/* SVG Illustration could go here */}
              </span>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Iniciar sesión
              </h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ingrese su usuario"
                      {...register("username")}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                    <span className="absolute right-4 top-4">
                      <Mail className="h-5 w-5 opacity-50" />
                    </span>
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-danger">{errors.username.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Ingrese su contraseña"
                      {...register("password")}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                    <span className="absolute right-4 top-4">
                      <Lock className="h-5 w-5 opacity-50" />
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
                  )}
                </div>

                <div className="mb-5">
                  <input
                    type="submit"
                    value={isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    disabled={isLoading}
                    className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-70"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
