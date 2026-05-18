import axios from "axios";
import { jwtDecode } from "jwt-decode";
import User from "../interfaces/User";
import Token from "../interfaces/Token";


const api: string = process.env.REACT_APP_API + "/users";

// get token data
export function decodeToken(): Token | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return jwtDecode<Token>(token)
};

// login
export function login(credentials: {email: string, password: string}) {
    return axios.post(`${api}/login`, credentials)
};

// register
export function register(userDetails: User) {
    return axios.post(api, userDetails)
};

// get all users
export function getAllUsers() {
    const token = localStorage.getItem("token");
    return axios.get(api, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// get user by id
export function getUserById(userId: string) {
    const token = localStorage.getItem("token");
    return axios.get(`${api}/${userId}`, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// update user
export function updateUser(userId: string, userDetails: User) {
    const token = localStorage.getItem("token");
    return axios.put(`${api}/${userId}`, userDetails, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// delete user
export function deleteUser(userId: string) {
    const token = localStorage.getItem("token");
    return axios.delete(`${api}/${userId}`, {
        headers: {
            "Authorization": token || ""
        }
    })
};