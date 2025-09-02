export const formatDate = (isoString) => {
  try {
    if (!isoString) return 'N/A';
    
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`; // Output format: YYYY-MM-DD
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};
