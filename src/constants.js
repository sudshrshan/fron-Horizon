// const API_URL=process.env.NODE_ENV !='development'?
// process.env.REACT_APP_BASE_URL:
// "http://localhost:8001"

// console.log(process.env,"API_URL");

// export default API_URL;

// const API_URL = "http://localhost:8000"; // ✅ Replace this with actual deployed backend URL
// export default API_URL;

const API_URL = process.env.NODE_ENV !== 'development'
  ? "https://conf-horizon.onrender.com"
  : "http://localhost:8000"; // local dev

export default API_URL;

