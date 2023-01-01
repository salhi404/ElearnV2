import { UserPublic } from "./user";

export interface Mail{
    id:string;
    isSent:boolean;
    fromTo:UserPublic;
    date:Date;
    subject:string;
    body:string;
    tags:string[]
}