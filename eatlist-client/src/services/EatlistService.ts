import axios from "axios";
import Eatlist from "../interfaces/Eatlist";


const api: string = process.env.REACT_APP_API + "/eatlists";

// get all eatlists
export function getAllEatlists() {
    const token = localStorage.getItem("token");
    return axios.get(api, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// get eatlist by id
export function getEatlistById(eatlistId: string) {
    const token = localStorage.getItem("token");
    return axios.get(`${api}/${eatlistId}`, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// create new eatlist
export function createEatlist(eatlist: any) {
    const token = localStorage.getItem("token");
    return axios.post(api, eatlist, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// update eatlist
export function updateEatlist(eatlistId: string, data: Eatlist) {
    const token = localStorage.getItem("token");
    return axios.patch(`${api}/${eatlistId}/update`, data, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// follow/unfollow an eatlist
export function followEatlist(eatlistId: string) {
    const token = localStorage.getItem("token");
    return axios.patch(`${api}/${eatlistId}/follow`, {}, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// add restaurant to eatlist
export function addRestaurantToEatlist(eatlistId: string, restaurantId: string) {
    const token = localStorage.getItem("token");
    return axios.post(`${api}/${eatlistId}/restaurants`, { restaurantId }, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// delete eatlist
export function deleteEatlist(eatlistId: string) {
    const token = localStorage.getItem("token");
    return axios.delete(`${api}/${eatlistId}`, {
        headers: {
            "Authorization": token || ""
        }
    })
};