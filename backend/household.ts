
import Member from "./Member.ts";
import User from "./User.ts";
class Household{
    name: string;
    members: Member[]
    //creatorName: string;
    //creatorBal//whatever balance the user input (ask for starting bal)

    constructor(creator: User, creatorBal: number, name: string){
        this.name = name;
        this.members = [];
        const creatorMember =  new Member(creator, creatorBal, true);
        this.members.push(creatorMember);
    }

    add_member(user : User, balance: number, admin: boolean){
        if(admin == false){
            const newmember = new Member(user, balance, false);
            this.members.push(newmember);
        }
        else{
            const newmember = new Member(user, balance, true);
            this.members.push(newmember);
        }

    }
}

export default Household;