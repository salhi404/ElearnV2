
export interface User{
    username:string;
    email:string;
    roles:string[];
    verified:boolean;
    pref:Pref;
    //fromTo:User
}
export interface UserPublic{
    username:string;
    email:string;
    status?:number;
    OnlineStat?:number;
}
export interface Pref{
    darkTheme:boolean;
    miniSideBar:boolean
}