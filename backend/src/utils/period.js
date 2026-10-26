const getPeriodRange = (period = 'this_month') => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  const key = String(period || 'this_month').toLowerCase().replace(/\s+/g, '_');

  if (key === 'last_month') {
    start.setMonth(start.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    return { start, end, key: 'last_month' };
  }

  if (key === 'last_3_months' || key === '3_months') {
    start.setMonth(start.getMonth() - 2, 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, key: 'last_3_months' };
  }

  if (key === 'last_6_months' || key === '6_months') {
    start.setMonth(start.getMonth() - 5, 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, key: 'last_6_months' };
  }

  if (key === '1_year' || key === 'year') {
    start.setFullYear(start.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, key: '1_year' };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end, key: 'this_month' };
};

module.exports = { getPeriodRange };
