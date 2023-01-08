import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @Input() type:number=1
  @Input() size:number=1
  @Input() width:number=14
  @Input() height:number=14
  constructor() { }

  ngOnInit(): void {
  }

}
