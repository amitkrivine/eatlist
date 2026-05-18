export interface EatlistRestaurant {
    _id: string;
    name: { main: string; alt?: string };
    description: string;
    phone?: string;
    address: { city: string; street: string; houseNumber: number };
    urls: { reservations?: string; website?: string; menu?: string; instagram?: string; tiktok?: string };
    imageUrl: string;
    genre: string;
    likes: { userId?: string }[];
    createdAt: string;
    updatedAt: string;
    restaurantId: string;
    userNote?: string;
    rank: number;
    dateAdded: string;
}