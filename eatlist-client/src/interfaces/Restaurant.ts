export default interface Restaurant {
    _id?: string;
    name: {
        main: string;
        alt?: string;
    };
    description: string;
    phone: string;
    address: {
        city: string;
        street: string;
        houseNumber: number;
    };
    urls: {
        reservations?: string;
        website?: string;
        menu?: string;
        instagram?: string;
    };
    imageUrl?: string;
    genre: string;
    likes: { userId: string; createdAt: string }[];
    createdAt?: Date;
    updatedAt?: Date;
}