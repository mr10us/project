export const handleErrorFields = (invalidFields) => {
  const errorFields = Object.entries(invalidFields).map(([key, value]) => {
    const errors = value.map(
      (error) => error[0].toUpperCase() + error.slice(1)
    );
    
    return {
      name: key,
      errors: errors,
    };
  });

  return errorFields;
};
