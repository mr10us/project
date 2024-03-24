export const getUrl = {
  pdf: (type, id, query, customerID, page) => {
    let head = import.meta.env.VITE_API_URL;

    if (query) {
      if (customerID) query = `customer_id=${customerID}&page_size=150&page=${page}&${query}`;
    } else query = `customer_id=${customerID}&page_size=150&page=${page}`;

    let url = "";
    switch (type) {
      case "measurement":
        url = `${head}/api/measurement/pdf/?${query}`;
        break;
      case "packet":
        url = `${head}/api/packet/${id}/pdf/`;
        break;
    }

    return url;
  },

  excel: (type, id, query, customerID, page) => {
    let head = import.meta.env.VITE_API_URL;

    if (query) {
      if (customerID) query = `customer_id=${customerID}&page_size=150&page=${page}&${query}`;
    } else query = `customer_id=${customerID}&page_size=150&page=${page}`;

    let url = "";
    switch (type) {
      case "measurement":
        url = `${head}/api/measurement/excel/?${query}`;
        break;
      case "packet":
        url = `${head}/api/packet/${id}/excel/`;
        break;
    }

    return url;
  },
};
