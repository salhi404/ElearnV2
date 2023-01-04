import { Component, OnInit } from '@angular/core';
import {  Router, } from '@angular/router';
@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss']
})
export class ErrorsComponent implements OnInit {
  errorNbr:number=404;
  errorMsg:string='';
  constructor(private router: Router,) { 
    const navigation = this.router.getCurrentNavigation();
    if(navigation){
      console.log("navigation zzzzzzzzzzzz");
      if(navigation.extras.state){
        const tempstate = navigation.extras.state as {errorNbr:number};
        this.errorNbr=tempstate.errorNbr;
      }
    }}
  ngOnInit(): void {
    switch (this.errorNbr) {
      case 404:
        this.errorMsg="The page you were looking for could not be found.";
      break;
      case 403:
        this.errorMsg="You do not have access to this page.";
      break;
      case 500:
        this.errorMsg="Whoopps, something went wrong.";
      break;
      case 503:
        this.errorMsg="Be right back.";
      break;
    }
  }

}
