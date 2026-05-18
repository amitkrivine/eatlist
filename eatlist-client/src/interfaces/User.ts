export default interface User {
    _id?: string;
    name: {
        first: string;
        last: string;
    };
    phone: string;
    email: string;
    password: string;
    address: {
        city: string;
        street: string;
        houseNumber: number;
    };
    imageUrl?: string;
    isAdmin?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}