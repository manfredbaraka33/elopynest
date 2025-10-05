import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useEffect, useRef } from 'react';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useApi() {
  const { token, logout, login } = useAuth();
  const refreshToken = localStorage.getItem('refreshToken');

  // Ref to hold the current token and prevent race conditions
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // To prevent multiple refresh calls simultaneously
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = (error, newToken = null) => {
    failedQueue.current.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(newToken);
      }
    });
    failedQueue.current = [];
  };

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      config => {
        if (tokenRef.current) {
          config.headers.Authorization = `Bearer ${tokenRef.current}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing.current) {
            // Queue the request until the refresh completes
            return new Promise(function (resolve, reject) {
              failedQueue.current.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = 'Bearer ' + token;
                return axiosInstance(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            // Call your refresh endpoint with refresh token
            const response = await axios.post(
              'http://127.0.0.1:8000/api/token/refresh/', // change to your refresh URL
              { refresh: refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            const newAccessToken = response.data.access;
            const newRefreshToken = response.data.refresh || refreshToken; // sometimes refresh token rotates

            // Update tokens in localStorage & context
            localStorage.setItem('token', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            login(newAccessToken, null); // call login to update context (pass username if needed)

            axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
          } catch (err) {
            processQueue(err, null);
            logout(); // logout on refresh failure
            return Promise.reject(err);
          } finally {
            isRefreshing.current = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken, login, logout]);

  const getData = async (endpoint, config = {}) => {
    const response = await axiosInstance.get(endpoint, config);
    return response.data;
  };

  const postData = async (endpoint, data, config = {}) => {
    const response = await axiosInstance.post(endpoint, data, config);
    return response.data;
  };

  const patchData = async (endpoint, data, config = {}) => {
    const response = await axiosInstance.patch(endpoint, data, config);
    return response.data;
  };

  const deleteData = async (endpoint, config = {}) => {
    const response = await axiosInstance.delete(endpoint, config);
    return response.data;
  };

  return {
    getData,
    postData,
    patchData,
    deleteData,
  };
}
