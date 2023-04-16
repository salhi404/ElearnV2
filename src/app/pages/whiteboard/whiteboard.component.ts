import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { fabric } from 'fabric';
import { Peer } from "peerjs";
@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss']
})
export class WhiteboardComponent implements OnInit {
  @ViewChild('dataContainer') dataContainer?: ElementRef;
  conn: any;
  peer: any;
  anotherid: any;
  mypeerid: any;
  attempt:number=0;
  canvas: any;
  oldcanvas: any;
  textString: string = '';
  size: any = {
    width: 1200,
    height: 1000
  };
  OutputContent: string = '';
  constructor() { }
  ngOnInit() {
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue'
    });
    this.textString = '';
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
    this.OutputContent = '';
    this.peer = new Peer();
    console.log('this.peer', this.peer);
    this.getPeerId();
    this.peer.on('connection', (conn: any) => {
      conn.on('data', (data: any) => {
        // Will print 'hi!'
      // this.canvas.loadFromJSON(data, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
      //     fabric.log(o, object);
      //   });
      if(this.dataContainer)this.dataContainer.nativeElement.innerHTML = data;
        console.log(data);
      });
    });


  }
  getPeerId(){
    setTimeout(() => {
      if(this.peer.id||this.attempt>25){
        this.mypeerid = this.peer.id;
      }else{
        this.attempt++;
        this.getPeerId();
      }
      console.log('attempt : '+this.attempt+'  this.peer  :', this.peer);
    }, 500);
  }
  canvasModifiedCallback(connection:any):any {
    console.log("connection",connection);
    
    return  ()=> {
      console.log('canvas modified!',connection);
      // if (connection)connection.send(this.canvas.toJSON())
      if (connection)connection.send(this.canvas.toSVG())
    }
     
    // if (connection)connection.send(this.canvas.toJSON());
  };


  send() {
    console.log('canvas modified!',this.conn);
    if (this.conn) this.conn.send('send test ');
  }
  connect() {
    this.conn = this.peer.connect(this.anotherid);
    this.conn.on('open', () => {
     // this.conn.send('Message from that id');
    });
    this.canvas.on('object:added', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:removed', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:modified', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:moving', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:scaling', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:rotating', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:skewing', this.canvasModifiedCallback(this.conn));
    this.canvas.on('object:resizing', this.canvasModifiedCallback(this.conn));
  }
  addText() {
    let textString = this.textString;
    let text = new fabric.IText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'helvetica',
      angle: 0,
      fill: '#000000',
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: '',
      hasRotatingPoint: true
    });
    // this.extend(text, this.randomId());
    this.canvas.add(text);
    this.selectItemAfterAdded(text);
    this.textString = '';
  }
  copycanvas() {
    this.oldcanvas = JSON.stringify(this.canvas.toJSON());
  }
  pastcanvas() {
    // this.canvas=this.oldcanvas;
    this.canvas.loadFromJSON(this.oldcanvas, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
      fabric.log(o, object);
    });
  }
  extend(obj: any, id: any) {
    obj.toObject = ((toObject) => {
      return () => {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }
  //======= this is used to generate random id of every object ===========
  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }
  //== this function is used to active the object after creation ==========
  selectItemAfterAdded(obj: any) {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }
  addFigure(figure: string) {
    let add: any;
    switch (figure) {
      case 'rectangle':
        add = new fabric.Rect({
          width: 200, height: 100, left: 10, top: 10, angle: 0,
          fill: '#3f51b5'
        });
        break;
      case 'square':
        add = new fabric.Rect({
          width: 100, height: 100, left: 10, top: 10, angle: 0,
          fill: '#4caf50'
        });
        break;
      case 'triangle':
        add = new fabric.Triangle({
          width: 100, height: 100, left: 10, top: 10, fill: '#2196f3'
        });
        break;
      case 'circle':
        add = new fabric.Circle({
          radius: 50, left: 10, top: 10, fill: '#ff5722'
        });
        break;
    }
    // this.extend(add, this.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
  }
  ExportToContent(input: string) {
    if (input == 'json') {
      // this.OutputContent = JSON.stringify(this.canvas.toJSON());
      console.log("this.canvas.toJSON()", this.canvas.toJSON());

    } else if (input == 'svg') {
      this.OutputContent = this.canvas.toSVG();
    }
  }
}
