import { EatlistRestaurant } from "./EatlistRestaurant";

export default interface Eatlist {
    _id?: string;
    name: string;
    userId: string;
    restaurants: EatlistRestaurant[];
    imageUrl?: string;
    description: string;
    followers: { userId: string }[];
    isPublic: boolean;
    color?: string;
    createdAt?: Date;
    updatedAt?: Date;
}