
export const formatCurrency = (amount) => {
  return `Bs. ${Number(amount || 0).toFixed(2)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  // Ensure we address timezone issues if passing raw strings. 
  // Usually, if treating as local date, simple get commands work.
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
