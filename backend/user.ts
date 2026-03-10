
class User{
    userid: string;
    username: string;
    email: string;
    //passwordHash: string; not sure how this should be included
    constructor(userid: string, username: string, email: string, passwordHash: string) {
        this.userid = userid;
        this.username = username;
        this.email = email;
        //this.passwordHash = passwordHash;
    }
}

export default User;