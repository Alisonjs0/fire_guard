export interface IUser {
    id: number;
    cpf: string;
    name?: string;
    email?: string;
    roles?: string[];
}