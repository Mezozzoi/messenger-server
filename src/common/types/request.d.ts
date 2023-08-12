import UserEntity from "../../modules/users/user.model";

// Declares user at Express Request
declare global {
    namespace Express {
        interface Request {
            user?: UserEntity
        }
    }
}