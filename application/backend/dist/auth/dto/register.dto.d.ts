import { UserRole } from '../schemas/user.schema';
export declare class RegisterDto {
    name: string;
    email: string;
    phone?: string;
    password: string;
    marketingConsent?: boolean;
    role?: UserRole;
}
