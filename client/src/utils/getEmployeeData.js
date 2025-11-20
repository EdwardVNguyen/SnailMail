export const getEmployeeData = async (auth_id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployeeData?authId=${auth_id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch employee data:', error);
    return null; // or handle error as needed
  }
};


