import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { ThemeProvider } from '@/components/theme-provider'
import { EmployeesList } from '@/pages/employees/EmployeesList'
import { EmployeeForm } from '@/pages/employees/EmployeeForm'
import { ProductsList } from '@/pages/products/ProductsList'
import { ProductForm } from '@/pages/products/ProductForm'
import { ServicesList } from '@/pages/services/ServicesList'
import { ServiceForm } from '@/pages/services/ServiceForm'
import { WarehousesList } from '@/pages/inventory/WarehousesList'
import { WarehouseForm } from '@/pages/inventory/WarehouseForm'
import { SuppliersList } from '@/pages/inventory/SuppliersList'
import { SupplierForm } from '@/pages/inventory/SupplierForm'
import { PurchasesList } from '@/pages/inventory/PurchasesList'
import { PurchaseForm } from '@/pages/inventory/PurchaseForm'
import { SalesList } from '@/pages/sales/SalesList'
import { SalesForm } from '@/pages/sales/SalesForm'
import { StockTransferForm } from '@/pages/inventory/StockTransferForm'
import { StockList } from '@/pages/inventory/StockList'
import { ServiceOrdersList } from '@/pages/services/ServiceOrdersList'
import { ServiceOrderForm } from '@/pages/services/ServiceOrderForm'
import { CustomersList } from '@/pages/customers/CustomersList';
import { CustomerForm } from '@/pages/customers/CustomerForm';
import { EmployeePerformanceReport } from '@/pages/reports/EmployeePerformanceReport';
import { EmployeePerformancePrint } from '@/pages/reports/EmployeePerformancePrint';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<EmployeesList />} />
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/:id/edit" element={<EmployeeForm />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/:id/edit" element={<ServiceForm />} />
            <Route path="inventory/warehouses" element={<WarehousesList />} />
            <Route path="inventory/warehouses/new" element={<WarehouseForm />} />
            <Route path="inventory/warehouses/:id/edit" element={<WarehouseForm />} />
            <Route path="inventory/suppliers" element={<SuppliersList />} />
            <Route path="inventory/suppliers/new" element={<SupplierForm />} />
            <Route path="inventory/suppliers/:id/edit" element={<SupplierForm />} />
            <Route path="inventory/purchases" element={<PurchasesList />} />
            <Route path="inventory/purchases/new" element={<PurchaseForm />} />
            <Route path="inventory/transfers/new" element={<StockTransferForm />} />
            <Route path="inventory/stock" element={<StockList />} />
            <Route path="sales" element={<SalesList />} />
            <Route path="sales/new" element={<SalesForm />} />
            <Route path="service-orders" element={<ServiceOrdersList />} />
            <Route path="service-orders/new" element={<ServiceOrderForm />} />
            <Route path="service-orders/:id" element={<ServiceOrderForm />} />

            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/new" element={<CustomerForm />} />
            <Route path="customers/:id" element={<CustomerForm />} />

            <Route path="reports/employee-performance" element={<EmployeePerformanceReport />} />
          </Route>
          <Route path="/print/employee-performance" element={<EmployeePerformancePrint />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
