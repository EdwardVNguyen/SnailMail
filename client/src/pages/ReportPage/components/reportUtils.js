// Get sort indicator for table headers
export const getSortIndicator = (field, currentField, currentDirection) => {
  if (currentField !== field) return ' ⇅';
  return currentDirection === 'asc' ? ' ↑' : ' ↓';
};

// Sort data array by field and direction
export const sortData = (data, field, direction) => {
  if (!data) return data;
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle numeric values
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle string values
    aVal = String(aVal || '').toLowerCase();
    bVal = String(bVal || '').toLowerCase();

    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return bVal < aVal ? -1 : bVal > aVal ? 1 : 0;
    }
  });
};
