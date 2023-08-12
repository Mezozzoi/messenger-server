import UserEntity from "src/modules/users/user.model";

class TokenDto {
    id;
    email;
    firstname;
    lastname

    constructor(user: UserEntity){
        this.id = user.id;
        this.email = user.email;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
    }
}

export default TokenDto;