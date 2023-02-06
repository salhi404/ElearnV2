import { UserPublic } from "./user";

export interface Mail{
    id:string;
    isSent:boolean;
    fromTo:{username:string;
        email:string;};
    date:Date;
    subject:string;
    body:string;
    tags:string[];
    label:number;
}