//alterauthuserdata
export interface User{
    username:string;
    email:string;
    roles:string[];
    verified:boolean;
    pref:Pref;
    contacts:[];
    fName:string,
    lName:string,
    birthDate:Date,
    grade:number,
    profileImage:string,
    USERDETAILS:any,
    info:any,
    //fromTo:User
}
export interface UserPublic{
    username:string;
    email:string;
    status?:number;
    OnlineStat?:number;
    profileImage:string,
}
export interface Pref{
    darkTheme:boolean;
    miniSideBar:boolean
}