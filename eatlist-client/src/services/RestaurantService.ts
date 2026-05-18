import axios from "axios";
import Restaurant from "../interfaces/Restaurant";


const api: string = process.env.REACT_APP_API + "/restaurants";

// get all restaurants
export function getAllRestaurants() {
    return axios.get(api)
};

// get restaurant by id
export function getRestaurantById(restaurantId: string) {
    return axios.get(`${api}/${restaurantId}`)
};

// add new restaurant
export function addRestaurant(restaurant: Restaurant) {
    const token = localStorage.getItem("token");
    return axios.post(api, restaurant, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// update restaurant
export function updateRestaurant(restaurantId: string, restaurant: Restaurant) {
    const token = localStorage.getItem("token");
    return axios.put(`${api}/${restaurantId}`, restaurant, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// like/unlike a restaurant
export function likeRestaurant(restaurantId: string) {
    const token = localStorage.getItem("token");
    return axios.patch(`${api}/${restaurantId}`, {}, {
        headers: {
            "Authorization": token || ""
        }
    })
};

// delete restaurant
export function deleteRestaurant(restaurantId: string) {
    const token = localStorage.getItem("token");
    return axios.delete(`${api}/${restaurantId}`, {
        headers: {
            "Authorization": token || ""
        }
    })
};