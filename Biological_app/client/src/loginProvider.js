import { AUTH_GET_PERMISSIONS, AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';
import axios from "axios";
import env from "react-dotenv";
import Swal from 'sweetalert2';


const baseUrl = env.BACKEND_URL;
export default {
    // authentication
    login: ({ username, password }) => {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: baseUrl,
                data: { "phone": username, "password": password },
                url: '/login',
                'Content-Type': 'application/json',
            })
            .then((response) => {
                axios({
                    method: 'get',
                    baseURL: baseUrl,
                    url: '/admin',
                    'Content-Type': 'application/json',
                    headers: { "Authorization": "Bearer " + response.data.data[0] },
                    params: { "uuid": response.data.data[2] }
                }).then((res) => {
                    if (res.data.result) {
                        localStorage.setItem('JWT', response.data.data[0]);
                        localStorage.setItem('uuid', response.data.data[2]);
                        resolve();
                    } else {
                        reject("You are not admin");
                    }
                }).catch(err => {
                    logger.error(err);
                    reject(err.response.data.message);
                });
            }).catch(err => {
                try {
                    console.log(err.response.data.message);
                    reject(err.response.data.message);
                } catch (e) {
                    console.log(err);
                    reject(err);
                }
            });
        });
    },
    checkError: error => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Server error!!!',
        });
        return Promise.resolve("Server error");
    },
    checkAuth: params => {
        return localStorage.getItem('JWT') ? Promise.resolve() : Promise.reject();
    },
    logout: () => {
        return new Promise((resolve, reject) => {
            localStorage.removeItem('JWT');
            localStorage.removeItem('uuid');
            resolve();
        });
    },
    getIdentity: () => Promise.resolve(/* ... */),
    handleCallback: () => Promise.resolve(/* ... */), // for third-party authentication only
    // authorization
    getPermissions: () => {
        const role = localStorage.getItem('JWT');
        return role ? Promise.resolve(role) : Promise.reject();
    },
};

