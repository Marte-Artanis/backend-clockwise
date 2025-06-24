export declare class UserRepository {
    findByEmail(email: string): Promise<any>;
    create(name: string, email: string, password: string): Promise<any>;
    validatePassword(user: {
        passwordHash: string;
    }, password: string): Promise<boolean>;
}
//# sourceMappingURL=repository.d.ts.map