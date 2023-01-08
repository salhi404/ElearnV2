import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-sceleton-load',
  templateUrl: './sceleton-load.component.html',
  styleUrls: ['./sceleton-load.component.scss']
})
export class SceletonLoadComponent implements OnInit {
  @Input()type:number=2;
  @Input()height:number=8;
  @Input()width:number=8;
  @Input()border:number=8;
  constructor() { }

  ngOnInit(): void {
  }

}
