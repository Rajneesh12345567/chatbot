const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
