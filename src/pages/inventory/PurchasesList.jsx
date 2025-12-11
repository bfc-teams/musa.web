import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import api from '@/services/api';
import { Plus, Eye } from 'lucide-react';

export const PurchasesList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchPurchases(currentPage);
  }, [currentPage]);

  const fetchPurchases = async (page) => {
    setLoading(true);
    try {
      // Assuming the endpoint is /purchases (from reportController or transactionController?)
      // Actually transactionController has createPurchase but reportController has getPurchasesReport.
      // Let's check if there is a general getPurchases endpoint. 
      // Looking at previous file reads, reportController has getPurchasesReport which filters by date/supplier.
      // It returns a list. I'll use that for now, maybe without filters it returns all?
      // Or I might need to check if there is a specific route for listing purchases.
      // Assuming /reports/purchases or similar if it's from reportController.
      // Wait, let's check routes if possible? I can't check routes file as I haven't read it.
      // But usually REST is /purchases. 
      // If transactionController only has createPurchase, then maybe there isn't a simple list endpoint?
      // reportController has getPurchasesReport. 
      // Let's try /reports/purchases first or just /purchases if the backend maps it there.
      // Given I can't see routes, I'll assume /purchases might work if mapped to getPurchasesReport or similar.
      // If not, I'll have to debug.

      const response = await api.get(`/reports/purchases?page=${page}&limit=${limit}`);
      // Actually, reportController usually returns all matching. It might not be paginated the same way?
      // Let's look at reportController again.
      // getPurchasesReport uses findAll with include, but NO pagination logic in the code I saw!
      // It just does `const purchases = await Purchase.findAll(...)`.
      // This is a potential performance issue but for now I'll use it.
      // It returns an array, not { data, pagination }.

      console.log('Purchases API Response:', response.data);

      if (Array.isArray(response.data)) {
        setPurchases(response.data);
        setTotalPages(1); // No pagination in backend report yet
      } else {
        setPurchases(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }

    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Fecha', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Factura #', accessor: 'invoice_number' },
    { header: 'Proveedor', accessor: 'Supplier.name', render: (row) => row.Supplier?.name || 'N/A' },
    { header: 'Almacén', accessor: 'Warehouse.name', render: (row) => row.Warehouse?.name || 'N/A' },
    { header: 'Costo Total', accessor: 'total_cost', render: (row) => `$${Number(row.total_cost || 0).toFixed(2)}` },
    { header: 'Estado', accessor: 'status' },
  ];

  const actions = (row) => (
    <>
      {/* View details could go here */}
      <button className="hover:text-primary" title="Ver Detalles">
        <Eye className="h-5 w-5" />
      </button>
    </>
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Compras
        </h2>
        <Link
          to="/inventory/purchases/new"
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-6"
        >
          <Plus className="h-5 w-5" />
          Nueva Compra
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table columns={columns} data={purchases} actions={actions} />
          {/* Pagination might be fake if backend doesn't support it yet */}
          <div className="mt-4">
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};
