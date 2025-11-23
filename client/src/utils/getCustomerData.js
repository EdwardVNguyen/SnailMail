export const getCustomerData = async (auth_id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/getCustomerData?authId=${auth_id}`);

    if (!response.ok) {
      console.error('Server error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Validate response structure
    if (data && data.success && data.customer) {
      return data;
    } else {
      console.error('Invalid response structure:', data);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch customer data:', error);
    return null;
  }
};


