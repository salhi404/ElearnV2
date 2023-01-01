
export interface User{
    username:string;
    email:string;
    roles:string[];
    verified:boolean;
    configs?:any;
    //fromTo:User
}
export interface UserPublic{
    username:string;
    email:string;
    status?:number;
}