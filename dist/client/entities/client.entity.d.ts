import { Model } from 'sequelize-typescript';
export declare class Client extends Model {
    id: string;
    name: string;
    email: string;
    phone?: string;
}
