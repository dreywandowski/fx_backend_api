import axios from 'axios';
import * as https from 'https';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export default axiosInstance;
