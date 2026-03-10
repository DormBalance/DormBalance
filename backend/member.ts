import User from './user';
class Member{
    name: string;
    balance: number;
    admin: boolean;
    constructor(curr_user: User, balance: number, admin: boolean){
        this.name = curr_user.username;
        this.balance = balance;
        this.admin = admin;
    }
}

export default Member;