import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Global response interceptor to gracefully mitigate session expiration and authentication issues
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 419) {
            const loginUrl = error.response?.data?.login_url || '/login';
            const message = error.response?.data?.message || 'Your session has expired. Please log in again to continue.';

            // Dispatch global event for UI layouts and modals
            window.dispatchEvent(
                new CustomEvent('specmatch:session-expired', {
                    detail: {
                        status,
                        message,
                        loginUrl,
                    },
                })
            );
        }

        return Promise.reject(error);
    }
);
