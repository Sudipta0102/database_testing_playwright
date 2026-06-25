export interface Order{

    id: number;
    userId: number;

    totalAmount: number;
    status: string;

    createdAt: Date;
    UpdatedAt: Date;
}