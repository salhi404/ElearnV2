import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { fabric } from 'fabric';
@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss']
})
export class WhiteboardComponent implements OnInit {
  @ViewChild('dataContainer') dataContainer?: ElementRef;
  @ViewChild('canvasElement') canvasElement?: ElementRef;
  
  @Output() wboardChange = new EventEmitter<void>();
  drawInstance: any = null;
  origX: any;
  origY: any;
  mouseDown = false;
  objectsTOErase: any[] = [];
  imageForm: any;
  options = {
    currentMode: '',
    currentColor: '#000000',
    currentWidth: 5,
    fill: false,
    group: {},
  };
  modes = {
    Erase: 'Erase',
    SELECT: 'SELECT',
    RECTANGLE: 'RECTANGLE',
    TRIANGLE: 'TRIANGLE',
    ELLIPSE: 'ELLIPSE',
    LINE: 'LINE',
    PENCIL: 'PENCIL',
    ERASER: 'ERASER',
  };

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

    // console.log("whiteboard.component");

    this.canvas = new fabric.Canvas('canvasElement', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      backgroundColor: "white",
      // perPixelTargetFind :true  
    });
    this.canvas.backgroundColor="white";
    this.canvas.renderTop();
    this.canvas.on('object:modified', (event: any) => {
      this.wboardChange.emit();
    })
    this.canvas.on('object:added', (event: any) => {
      this.wboardChange.emit();
      // console.log('object:added');
      
    })
    this.canvas.on('object:removed', (event: any) => {
      this.wboardChange.emit();
    })
    this.canvas.on('path:created', (event: any) => {
      this.wboardChange.emit();
      if(this.options.currentMode===this.modes.PENCIL){
        event.path.set({
          perPixelTargetFind: true,
          selectable: false,
        })
      }

    })
    this.textString = '';
    // this.canvas.setWidth(this.size.width);
    // this.canvas.setHeight(this.size.height);
    this.SelectMode();
    fabric.Object.prototype.selectable = false;
    this.OutputContent = '';
  }
  setSize(width: number) {
    this.canvas.setDimensions({ width: width, height: Math.round(width / 1.77) });
    this.canvas.setZoom(width / 1500)
    // this.canvas.setWidth(width);
    // this.canvas.setHeight(height);
  }
  startDrawing() {
    return () => {
      this.canvas.discardActiveObject().requestRenderAll();
      this.canvas.requestRenderAll();
      this.canvas.renderAll();
      // if (this.conn) this.conn.send(this.canvas.toSVG())
      // console.log("Drawing");

      // switch (this.options.currentMode) {
      //   case this.modes.SELECT:

      //     break;
      //   case this.modes.RECTANGLE:

      //     break;
      //   case this.modes.TRIANGLE:

      //     break;
      //   case this.modes.ELLIPSE:

      //     break;
      //   case this.modes.SELECT:

      //     break;
      //   case this.modes.SELECT:

      //     break;
      //   case this.modes.SELECT:

      //     break;


      // }
    }
  }
  stopDrawing() {
    return () => {
      // console.log("stopDrawing");
      this.mouseDown = false;
      // this.send();
      // console.log("stopDrawing => this.mouseDown :", this.mouseDown);
    }
  }
  updateMode() {
    if (this.options.currentMode === this.modes.SELECT) this.SelectMode();
  }
  removeCanvasListener() {
    this.canvas.off('mouse:down');
    this.canvas.off('mouse:move');
    this.canvas.off('mouse:up');
    this.canvas.off('mouse:over');
  }
  resetparameters() {
    this.removeCanvasListener();
    if (this.options.currentMode !== this.modes.Erase) {
      this.canvas.getObjects().map((item: any) => {
        if (!item.path) item.set({
          perPixelTargetFind: false
        })
        // console.log("item", item);
      });
    }
  }
  SelectMode() {
    this.options.currentMode = this.modes.SELECT;
    this.canvas.isDrawingMode = false;
    this.resetparameters();
    this.canvas.selection = true;
    this.canvas.hoverCursor = 'auto';
    this.canvas.getObjects().map((item: any) => {
      if (!item.path)
        item.set({ selectable: true })
      // console.log("item", item);

    }
    );
  }
  clearCanvas() {
    this.canvas.getObjects().forEach((item: any) => {
      if (item !== this.canvas.backgroundImage) {
        this.canvas.remove(item);
      }
    });
  }

  uploadImage(e: any) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.addEventListener('load', () => {
      if (reader.result && typeof (reader.result) === "string") {
        fabric.Image.fromURL(reader.result, (img) => {
          img.scaleToHeight(this.canvas.height);
          this.canvas.add(img);
          this.SelectMode();
          this.canvas.setActiveObject(img);
        });
      }

    });

    reader.readAsDataURL(file);
  }

  /*  ==== erase  ==== */
  erase() {
    if (this.options.currentMode !== this.modes.Erase) {
      this.canvas.getObjects().map((item: any) => {
        // if(!item.path)
        item.set({
          // selectable: true ,
          perPixelTargetFind: true
        })
        // console.log("item", item);
      }
      );
      this.options.currentMode = this.modes.Erase;

      this.resetparameters();
      this.canvas.on('mouse:down', this.startErase());
      this.canvas.on('mouse:move', this.startErasing());
      this.canvas.on('mouse:up', this.stopErasing());

      this.canvas.selection = false;
      this.canvas.hoverCursor = 'auto';
      this.canvas.isDrawingMode = false;
      this.canvas.getObjects().map((item: any) => item.set({ selectable: false }));
      this.canvas.discardActiveObject().requestRenderAll();
    }
  }

  startErase() {
    return (e: any) => {
      this.objectsTOErase = [];
      this.mouseDown = true;
    };
  }

  startErasing() {
    return (e: any) => {
      // var target =this.canvas.findTarget(<MouseEvent>(e.e), true);
      // if(target)target.set('stroke', 'red');

      if (this.mouseDown && e.target) {
        e.target.set('stroke', 'red');
        this.objectsTOErase.push(e.target);
        // if (e.target !== this.canvas.backgroundImage) {
        //   this.canvas.remove(e.target);
        // }
      }
      // console.log("MouseEvent", e);
      // console.log("this.objectsTOErase", this.objectsTOErase);
      this.canvas.renderAll();
    };
  }
  stopErasing() {
    return () => {
      this.mouseDown = false;
      this.objectsTOErase.forEach(element => {
        if (element !== this.canvas.backgroundImage) {
          this.canvas.remove(element);
        }
      });
      this.canvas.renderAll();
      // this.send();
    }
  }
  deleteselected() {
    // console.log('deleteselected getActiveObject .', this.canvas.getActiveObject());
    if (!this.canvas.getActiveObject()) {
      // console.log('falsy getActiveObject');
      return;
    }
    // console.log('deleteselected getActiveObject 2 ', this.canvas.getActiveObject()._objects);
    if (this.canvas.getActiveObject()._objects) {
      this.canvas.getActiveObject()._objects.forEach((element: any) => {
        {
          // if (element !== this.canvas.backgroundImage) {
          this.canvas.remove(element);
          // }
        }
      });
      this.canvas.remove(this.canvas.getActiveObject());
    } else
      if (this.canvas.getActiveObject() !== this.canvas.backgroundImage) {
        this.canvas.remove(this.canvas.getActiveObject());
      }
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }
  groupselected() {
    if (!this.canvas.getActiveObject()) {
      return;
    }
    if (this.canvas.getActiveObject().type !== 'activeSelection') {
      return;
    }
    this.canvas.getActiveObject().toGroup();
    this.canvas.requestRenderAll();
    this.wboardChange.emit();
    this.SelectMode()
  }
  tessst() {
    return (e: any) => {
      // console.log("e", e);
      e.path.set({
        perPixelTargetFind: true,
        selectable: false,
      })
    }
  }
  /*  ==== draw  ==== */
  draw() {
    if (this.options.currentMode !== this.modes.PENCIL) {
      this.resetparameters();
      // this.canvas.on('path:created', this.tessst());

      // this.canvas.on('mouse:move', this.startDrawing());
      this.options.currentMode = this.modes.PENCIL;
      // canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      this.canvas.freeDrawingBrush.width = this.options.currentWidth;
      // this.canvas.freeDrawingBrush.hasControls = this.canvas.freeDrawingBrush.hasBorders = false;
      // this.canvas.freeDrawingBrush.perPixelTargetFind = true;
      // console.log("this.canvas.freeDrawingBrush", this.canvas.freeDrawingBrush);

      this.canvas.isDrawingMode = true;
    }
  }
  /*  ==== line  ==== */
  createLine() {
    if (this.options.currentMode !== this.modes.LINE) {
      this.options.currentMode = this.modes.LINE;

      this.resetparameters();
      this.canvas.on('mouse:down', this.startAddLine());
      this.canvas.on('mouse:move', this.startDrawingLine());
      this.canvas.on('mouse:up', this.stopDrawing());

      this.canvas.selection = false;
      this.canvas.hoverCursor = 'auto';
      this.canvas.isDrawingMode = false;
      this.canvas.getObjects().map((item: any) => item.set({ selectable: false }));
      this.canvas.discardActiveObject().requestRenderAll();
    }
  }

  startAddLine() {
    return (e: any) => {
      // console.log('e:any :', e);

      this.mouseDown = true;

      let pointer = this.canvas.getPointer(e);
      this.drawInstance = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: this.options.currentWidth,
        stroke: this.options.currentColor,
        selectable: false,
      });
      this.drawInstance.perPixelTargetFind = true;
      this.canvas.add(this.drawInstance);
      this.canvas.requestRenderAll();
    };
  }

  startDrawingLine() {
    return (e: any) => {
      // console.log("startDrawingLine => this.mouseDown :", this.mouseDown);

      if (this.mouseDown) {
        const pointer = this.canvas.getPointer(e);
        this.drawInstance.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        this.drawInstance.setCoords();
        this.canvas.requestRenderAll();
        this.wboardChange.emit();
        // if (this.conn) this.conn.send(this.canvas.toSVG())
      }
    };
  }
  /* ==== rectangle ==== */
  createRect() {
    if (this.options.currentMode !== this.modes.RECTANGLE) {
      this.options.currentMode = this.modes.RECTANGLE;

      this.resetparameters();

      this.canvas.on('mouse:down', this.startAddRect());
      this.canvas.on('mouse:move', this.startDrawingRect());
      this.canvas.on('mouse:up', this.stopDrawing());

      this.canvas.selection = false;
      this.canvas.hoverCursor = 'auto';
      this.canvas.isDrawingMode = false;
      this.canvas.getObjects().map((item: any) => item.set({ selectable: false }));
      this.canvas.discardActiveObject().requestRenderAll();
    }
  }

  startAddRect() {
    return (e: any) => {
      this.mouseDown = true;

      const pointer = this.canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;

      this.drawInstance = new fabric.Rect({
        stroke: this.options.currentColor,
        strokeWidth: this.options.currentWidth,
        fill: this.options.fill ? this.options.currentColor : 'transparent',
        left: this.origX,
        top: this.origY,
        width: 0,
        height: 0,
        selectable: false,
      });

      this.canvas.add(this.drawInstance);

      // this.drawInstance.on('this.mouseDown', (e) => {
      //   if (this.options.currentMode === this.modes.ERASER) {
      //     this.canvas.remove(e.target);
      //   }
      // });
    };
  }

  startDrawingRect() {
    return (e: any) => {
      if (this.mouseDown) {
        const pointer = this.canvas.getPointer(e);

        if (pointer.x < this.origX) {
          this.drawInstance.set('left', pointer.x);
        }
        if (pointer.y < this.origY) {
          this.drawInstance.set('top', pointer.y);
        }
        this.drawInstance.set({
          width: Math.abs(pointer.x - this.origX),
          height: Math.abs(pointer.y - this.origY),
        });
        this.drawInstance.setCoords();
        this.canvas.renderAll();
        this.wboardChange.emit();
        // if (this.conn) this.conn.send(this.canvas.toSVG())
      }
    };
  }

  /* ==== Ellipse ==== */
  createEllipse() {
    if (this.options.currentMode !== this.modes.ELLIPSE) {
      this.options.currentMode = this.modes.ELLIPSE;

      this.resetparameters();

      this.canvas.on('mouse:down', this.startAddEllipse());
      this.canvas.on('mouse:move', this.startDrawingEllipse());
      this.canvas.on('mouse:up', this.stopDrawing());

      this.canvas.selection = false;
      this.canvas.hoverCursor = 'auto';
      this.canvas.isDrawingMode = false;
      this.canvas.getObjects().map((item: any) => item.set({ selectable: false }));
      this.canvas.discardActiveObject().requestRenderAll();
    }
  }

  startAddEllipse() {
    return (e: any) => {
      this.mouseDown = true;

      const pointer = this.canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;
      this.drawInstance = new fabric.Ellipse({
        stroke: this.options.currentColor,
        strokeWidth: this.options.currentWidth,
        fill: this.options.fill ? this.options.currentColor : 'transparent',
        left: this.origX,
        top: this.origY,
        cornerSize: 7,
        objectCaching: false,
        selectable: false,
      });

      this.canvas.add(this.drawInstance);
    };
  }

  startDrawingEllipse() {
    return (e: any) => {
      if (this.mouseDown) {
        const pointer = this.canvas.getPointer(e);
        if (pointer.x < this.origX) {
          this.drawInstance.set('left', pointer.x);
        }
        if (pointer.y < this.origY) {
          this.drawInstance.set('top', pointer.y);
        }
        this.drawInstance.set({
          rx: Math.abs(pointer.x - this.origX) / 2,
          ry: Math.abs(pointer.y - this.origY) / 2,
        });
        this.drawInstance.setCoords();
        this.canvas.renderAll();
        this.wboardChange.emit();
        // if (this.conn) this.conn.send(this.canvas.toSVG())
      }
    };
  }

  /* === triangle === */
  createTriangle() {
    if (this.options.currentMode !== this.modes.TRIANGLE) {
      this.options.currentMode = this.modes.TRIANGLE;
      this.resetparameters();

      this.canvas.on('mouse:down', this.startAddTriangle());
      this.canvas.on('mouse:move', this.startDrawingTriangle());
      this.canvas.on('mouse:up', this.stopDrawing());

      this.canvas.selection = false;
      this.canvas.hoverCursor = 'auto';
      this.canvas.isDrawingMode = false;
      this.canvas.getObjects().map((item: any) => item.set({ selectable: false }));
      this.canvas.discardActiveObject().requestRenderAll();
    }
  }

  startAddTriangle() {
    return (e: any) => {
      this.mouseDown = true;
      this.options.currentMode = this.modes.TRIANGLE;

      const pointer = this.canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;
      this.drawInstance = new fabric.Triangle({
        stroke: this.options.currentColor,
        strokeWidth: this.options.currentWidth,
        fill: this.options.fill ? this.options.currentColor : 'transparent',
        left: this.origX,
        top: this.origY,
        width: 0,
        height: 0,
        selectable: false,
      });

      this.canvas.add(this.drawInstance);
    };
  }

  startDrawingTriangle() {
    return (e: any) => {
      if (this.mouseDown) {
        const pointer = this.canvas.getPointer(e);
        if (pointer.x < this.origX) {
          this.drawInstance.set('left', pointer.x);
        }
        if (pointer.y < this.origY) {
          this.drawInstance.set('top', pointer.y);
        }
        this.drawInstance.set({
          width: Math.abs(pointer.x - this.origX),
          height: Math.abs(pointer.y - this.origY),
        });

        this.drawInstance.setCoords();
        this.canvas.renderAll();
        this.wboardChange.emit();
        // if (this.conn) this.conn.send(this.canvas.toSVG())
      }
    };
  }






  addText() {
    let textString ="new Text" //this.textString;
    let text = new fabric.IText(textString, {
      left: 120,
      top: 120,
      fontFamily: 'helvetica',
      angle: 0,
      fill: '#000000',
      scaleX: 2,
      scaleY: 2,
      fontWeight: '',
      hasRotatingPoint: true
    });
    // this.extend(text, this.randomId());
    this.selectItemAfterAdded(text);
    this.canvas.add(text);
    this.textString = '';
    this.SelectMode();
    // this.canvas.setActiveObject(text);
  }
  copycanvas() {
    this.oldcanvas = JSON.stringify(this.canvas.toJSON());
  }
  pastcanvas() {
    // this.canvas=this.oldcanvas;
    this.canvas.loadFromJSON(this.oldcanvas, this.canvas.renderAll.bind(this.canvas), (o: any, object: any) => {
      // fabric.log(o, object);
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
      // console.log("this.canvas.toJSON()", this.canvas.toJSON());

    } else if (input == 'svg') {
      this.OutputContent = this.canvas.toSVG();
    }
  }
}
