import React from 'react';

export const InputGroup = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  customClasses = '',
  autoComplete,
  disabled = false,
}) => {
  return (
    <div className={`mb-4.5 ${customClasses}`}>
      <label className="mb-2.5 block text-black dark:text-white">
        {label} {required && <span className="text-meta-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        {...register(name, { required })}
        className={`w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${error ? 'border-meta-1 focus:border-meta-1' : ''
          }`}
      />
      {error && <span className="text-meta-1 text-sm mt-1">{error.message}</span>}
    </div>
  );
};

export const SelectGroup = ({
  label,
  name,
  options,
  register,
  error,
  required = false,
  customClasses = '',
  placeholder,
  disabled = false,
}) => {
  return (
    <div className={`mb-4.5 ${customClasses}`}>
      <label className="mb-2.5 block text-black dark:text-white">
        {label} {required && <span className="text-meta-1">*</span>}
      </label>
      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          disabled={disabled}
          {...register(name, { required })}
          className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${error ? 'border-meta-1' : ''
            }`}
        >
          <option value="" disabled className="text-body dark:text-bodydark">
            {placeholder || `Seleccionar ${label}`}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-body dark:text-bodydark">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>
      {error && <span className="text-meta-1 text-sm mt-1">{error.message}</span>}
    </div>
  );
};

export const CheckboxGroup = ({
  label,
  name,
  register,
  error,
  customClasses = ''
}) => {
  return (
    <div className={`mb-4.5 ${customClasses}`}>
      <label
        htmlFor={name}
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id={name}
            className="sr-only"
            {...register(name)}
          />
          <div className="box mr-4 flex h-5 w-5 items-center justify-center rounded border border-primary bg-gray dark:bg-transparent">
            <span className="opacity-0">
              <svg
                width="11"
                height="8"
                viewBox="0 0 11 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.766639 9.62633 0.775069 9.45727 0.959339L4.18729 6.70456L1.53872 3.81741L1.53394 3.81152L1.52855 3.80601C1.34801 3.63208 1.07358 3.64051 0.904522 3.82478C0.735465 4.00905 0.743124 4.29742 0.91705 4.47135L0.921834 4.47724L0.927224 4.48275L3.89722 7.71985L3.90201 7.72574L3.90739 7.73125C4.08793 7.90518 4.36237 7.89675 4.53143 7.71248L10.079 1.66501C10.248 1.48074 10.2404 1.19237 10.0665 1.01844L10.0617 1.01255L10.0563 1.00704L10.0915 0.951972ZM4.21729 6.73727L4.21251 6.73138L4.20712 6.72587L4.18729 6.70456L4.21729 6.73727Z"
                  fill="#3C50E0"
                  stroke="#3C50E0"
                  strokeWidth="0.4"
                ></path>
              </svg>
            </span>
          </div>
        </div>
        {label}
      </label>
      {error && <span className="text-meta-1 text-sm mt-1">{error.message}</span>}
    </div>
  )
}
