import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { User } from 'app/Interfaces/user';
import { filter, Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { EventsService } from 'app/services/events.service';
import { parsegrade, parseroles, getmainrole, getmainrolecode, parsesubject, parsesubjectIcon } from 'app/functions/parsers';
import { DatePipe } from '@angular/common';
import { SocketioService } from 'app/services/socketio.service';


@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})

export class TeacherDashboardComponent implements OnInit, OnDestroy {
  user: User = null as any;
  timeouts:any[]=[];
  classes: any[] = [];
  roles: string[] = [];
  mainRole: String = '';
  mainRolecode: number = -1;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  subscription3: Subscription = new Subscription();
  subscription4: Subscription = new Subscription();
  isLoggedIn: boolean = false;
  activeroute: number = 1;
  navigationExtras: NavigationExtras = { state: null as any };
  usersCount: number = -1;
  connectedCount: number = -1;
  blockHostListener = false;
  chosenClass: any = null;
  chosenIndex: number = -1;
  modelShowen: boolean = false;
  fadeModel: boolean = false;
  attemptogetClasses: number = 0;
  modalEvent: Subject<number> = new Subject<number>();
  addnotEdit = true;
  firstskiped = false;
  selectedEventCount: number[] = [];
  selectedEventCounttoday: number[] = [];
  // selectednextEvent: Date[] = [];
  classesCount:number=0;
  datepipe: DatePipe = new DatePipe('en-US');
  form: any = {
    class: '',
    subject: 1,
  }
  @ViewChild("modalDialog") modalDialog!: ElementRef;
  loadingClasses: boolean=true;
  constructor(private storageService: StorageService,
     private authService: AuthService,
     private teacherservice: TeacherService,
     private events: EventsService,
     private router: Router,
     private socketService: SocketioService,
     ) { }
  swithroutes(url:string){
    switch (url) {
      case "/teacher-dashboard/users":
        this.activeroute = 1
        break;
      case "/teacher-dashboard/events":
        this.activeroute = 2
        break;
      case "/teacher-dashboard/notifications":
        this.activeroute = 3
        break;
      case "/teacher-dashboard/liveStreams":
        this.activeroute = 4
        break;
        case "/teacher-dashboard/whiteboard":
        this.activeroute = 5
        break;
      default:
        this.activeroute = -1
        break;
    }
  }
  ngOnInit(): void {
    this.swithroutes(this.router.url);
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log("router event change");
      this.swithroutes(this.router.url);
    });
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.storageService.getUser();
      this.subscription = this.events.userdataEvent.subscribe(
        state => {
          
            if (state.state == this.events.UPDATEUSER) {
              this.user = state.userdata;
              this.roles = parseroles(this.user.roles);
              this.mainRole = getmainrole(this.roles);
              this.mainRolecode = getmainrolecode(this.user.roles);
              this.classesCount = this.user.info.classesCount;
              // console.log("this.classesCount = ",this.classesCount);
              // if(!this.roles.includes('Teacher')){
              //   this.navigationExtras={ state: {errorNbr:403} };
              //   this.router.navigate(['/error'],this.navigationExtras);
              //   console.log("not autherised");
              // }
            }
            if (state.state == this.events.DALETEUSER) {
              this.user = null as any;
              this.roles = [];
              this.mainRole = '';
              this.mainRolecode = -1;
            }
          
          
        }
      )
      this.subscription4 = this.socketService.recieveTask.subscribe(data => {
        console.log("subscription4",data);
        
        if (data.code == 1) {
          data.data.forEach((element:any) => {
            console.log("element",element);
            let notifToEdit =  this.classes.find((cll:any)=>cll.uuid===element.classId)?.data.notifications.find((nttf:any)=>nttf.id==element.notifId)
            if(notifToEdit) notifToEdit.status=element.notif.status;
            console.log("notifToEdit",notifToEdit);
          });
        }
      });
      /*this.subscription1=this.events.modinfostatusEvent.subscribe(state=>{
        if(state.usersCount){
          this.usersCount=state.usersCount;
        }
        if(state.connectedCount){
          this.connectedCount=state.connectedCount;
        }
      })*/

      this.subscription3 = this.events.taskEvent.subscribe(state => {
        if(this.firstskiped){
        
        if (state.task == this.events.TASKOPENMODAL) {
          this.openModel(true)
        }
        if (state.task == this.events.TASKGETCLASSES) {
          this.getclasses(true);
        }
        if (state.task == this.events.TASKCHOOSECLASSES) {
          this.chosenIndex = state.data.chosenIndex;
          this.putClass(state.data.chosenClass);
        }
        if (state.task == this.events.TASKREFRESHCONNECTED) {
          this.getconnectedchaters(state.data.uuid);
        }
        if (state.task == this.events.TASKGETCHOSENCLASS) {
          this.events.changeTaskState({ task: this.events.TASKCHOOSECLASSES, data: { chosenIndex: this.chosenIndex, chosenClass: this.chosenClass } })
        }
        if (state.task == this.events.TASKUPDATECLASSEVENT) {
          if(state.data.tasktype==1){
            this.classes.find(cll=>cll.uuid==state.data.classid)?.data.events.push(state.data.event);
            this.updateventcount(new Date(state.data.event.start),state.data.classind,true);
          }
          if(state.data.tasktype==2){
            const findclass=this.classes.find(cll=>cll.uuid==state.data.classid);
            if(findclass){
              const index = findclass.data.events.findIndex((evv:any)=>evv.id==state.data.event.id);
              if(index!=-1) findclass.data.events[index] = state.data.event
            }
            this.updateventcount(new Date(state.data.event.start),state.data.classind,false);
          }
          if(state.data.tasktype==3){
            const findclass=this.classes.find(cll=>cll.uuid==state.data.classid);
            if(findclass){
              const index = findclass.data.events.findIndex((evv:any)=>evv.id==state.data.event.id);
              const notifIdtemp = findclass.data.notifications.find((ntf:any)=>ntf.for==state.data.event.id)?.id||-1;
              if(index!=-1){
                console.log("notifIdtemp",notifIdtemp);
                if(notifIdtemp!=-1)this.removeNotif(notifIdtemp);
                findclass.data.events.splice(index,1);
              } 
              const todayDate = new Date();
              let nextDate: Date = null as any;
              let date: Date;
              let todayCount = 0;
              findclass.data.events.forEach((event: any) => {
                date = new Date(event.start);
                if (
                  date.getDate() === todayDate.getDate() &&
                  date.getMonth() === todayDate.getMonth() &&
                  date.getFullYear() === todayDate.getFullYear()
                ) todayCount++;
                if (date.getTime() > todayDate.getTime()) {
                  if (!nextDate || date.getTime() < nextDate.getTime()) nextDate = date;
                }
              })
              this.selectedEventCount[state.data.classind]=findclass.data.events.length;
              this.selectedEventCounttoday[state.data.classind]=todayCount;
            }
          }
        }
        // if (state.task == this.events.TASKDELETECLASSNOTIFSCHEDULE) {
        //   let findNtfSchd = this.classes.find((cll:any)=>cll.uuid===state.data.classuuid)?.data.notifschedule;
        //   findNtfSchd = findNtfSchd.filter((ntf:any)=>ntf!=state.data.id);
        // }
        if (state.task == this.events.TASKUPDATECLASSNOTIF) {
          if(state.data.tasktype==1){
            this.classes.find(cll=>cll.uuid==state.data.classid)?.data.notifications.push(state.data.notif);
            setTimeout(() => {
              this.calculateStats();
            }, 0);
          }
          if(state.data.tasktype==2){
            const findclassnotif=this.classes.find(cll=>cll.uuid==state.data.classid);
            if(findclassnotif){
              const index = findclassnotif.data.notifications.findIndex((notiff:any)=>notiff.id==state.data.notif.id);
              findclassnotif.data.notifications[index] = state.data.notif
              setTimeout(() => {
                this.calculateStats();
              }, 0);
            }
          }
          if(state.data.tasktype==3){
            let classFound =  this.classes.find(cll=>cll.uuid==state.data.classid);
            if(classFound){
              setTimeout(() => {
                const  notifToDelete = classFound.data.notifications.findIndex((ntf:any)=>ntf.id==state.data.notifId);
              if(notifToDelete!=-1){
                
                if(classFound.data.notifications[notifToDelete].new){
                  classFound.newNotifCount--
                }
                  
                classFound.data.notifications.splice(notifToDelete,1);

              }
                this.calculateStats();
              }, 0);
              
            }
          }
          if(state.data.tasktype==4){
            console.log(".tasktype==4    dash");
            const findClass = this.classes.find(cll=>cll.uuid==state.data.classid);
            if(findClass){
              findClass.data.notifications.push({...state.data.notif,new:true});
              console.log("findClass 1 ",findClass);
              findClass.newNotifCount++
              console.log("findClass 2 ",findClass);

            }
            if(this.chosenClass)this.putClass(this.classes.find(cll=>cll.uuid==this.chosenClass.uuid))
          }
          if(state.data.tasktype==5){
            const findClass = this.classes.find(cll=>cll.uuid==state.data.classid);
            setTimeout(() => {
              findClass.newNotifCount=0;
              findClass.data.notifications.forEach((element:any) => {
                if(element.new) delete element.new
              });
            }, 0);
          }
        }
        if (state.task == this.events.TASKUPDATECLASSSTREAM) {
          if(state.data.tasktype==1){
            this.classes.find(cll=>cll.uuid==state.data.classid)?.data.livestreams.push(state.data.liveStream);
            this.calculateStats();
          }
        }
      }else this.firstskiped = true
      })
      this.getclasses(false); // TODO - implement reload (online + new enrollers ...) with socket or add a button 
    } else {
      this.navigationExtras = { state: { errorNbr: 403 } };
      this.router.navigate(['/error'], this.navigationExtras);
    }
  }
  putClass(classe:any){
    console.log("put class",classe);
    this.chosenClass=classe;
    this.calculateStats();
  }
  calculateStats(){
    const now =new Date();
    const today =this.datepipe.transform(now,"yyyy-MM-dd");
    console.log("today",today);
    
    if(this.chosenClass){
      this.chosenClass.notifCount=this.chosenClass.data.notifications.length;
      this.chosenClass.notifNotSentCount=this.chosenClass.data.notifications.filter((ntf:any)=>ntf.status==1).length;
      this.chosenClass.notifinqueue=this.chosenClass.data.notifications.filter((ntf:any)=>ntf.status==2).length;
      this.chosenClass.streamCount=this.chosenClass.data.livestreams.length;
      this.chosenClass.streamtodayCount=this.chosenClass.data.livestreams.filter((ntf:any)=>{
        console.log("test ",ntf.start_time.substring(0,10));
        
        return ntf.start_time.substring(0,10)===today}).length;
    }
  }
  activateroute(ind: number) {
    this.activeroute = ind;
    if (ind == 1) {
      this.router.navigate(['/teacher-dashboard/users']);
    }
    if (ind == 2) {
      this.router.navigate(['/teacher-dashboard/events']);
    }
    if (ind == 3) {
      this.router.navigate(['/teacher-dashboard/notifications']);
    }
    if (ind == 4) {
      this.router.navigate(['/teacher-dashboard/liveStreams']);
    }
    if (ind == 5) {
      this.router.navigate(['/teacher-dashboard/whiteboard']);
    }
    
  }
  getclasses(refresh: boolean) {
    this.subscription1 = this.teacherservice.getClasses().subscribe({
      next: data => {
        
        if (data.classes) {
          console.log("getClasses 1",data);
          data.classes.forEach((element:any) => {
            element.newNotifCount=0;
          });
          console.log("getClasses 2",data);
          this.classes = data.classes.sort(function (a:any, b:any) {
            return (new Date(a.created).getTime()) - (new Date(b.created).getTime());
          });
          console.log("this.classes ",this.classes );
          
          this.loadingClasses=false;
          this.gettodayCalender();
          // this.checkscheduleedNotif();
          if (refresh) {
            this.events.changeclassInfoState({ state: 2, classes: this.classes });
          }
          else { 
            this.events.changeclassInfoState({ state: 1, classes: this.classes }); 

          }
        }
      },
      error: err => { console.log(err); }
    })
  }
  // checkscheduleedNotif(){
  //   this.classes.forEach((classe:any,indd)=>{
  //   classe.data.notifschedule.forEach((nttf:any) => {
  //     console.log("found schedule 1 ",nttf);
  //     const nowtemp = new Date();
  //     const formTime = new Date(nttf.time);
  //     const timeDif =formTime.getTime() - nowtemp.getTime()
  //   if (timeDif<0) {
  //     console.log("found schedule to edit ",nttf);
  //     nttf.status = 3;
  //     this.editNotifSubmit(classe.uuid,nttf,true,1);
  //     this.events.changeTaskState({ task: this.events.TASKDELETECLASSNOTIFSCHEDULE, data: { classuuid:classe.uuid, id:nttf.id  } })
  //     // classe.data.notifschedule.pop(nttf);
  //   }else{
  //     if(timeDif<300000){
  //       console.log("found schedule to schedule ",nttf);
  //       console.log("schedule in",timeDif);
  //       let nttf2={...nttf}
  //       nttf2.status = 3;
  //       this.timeouts.push( // TODO clear time out
  //         setTimeout(() => {
  //           this.editNotifSubmit(classe.uuid,nttf2,true,1);
  //           this.events.changeTaskState({ task: this.events.TASKDELETECLASSNOTIFSCHEDULE, data: { classuuid:classe.uuid, id:nttf.id  } })
  //           // classe.data.notifschedule.pop(nttf);
  //         }, timeDif+2000)
  //       )
  //     }

  //   }
  //   });

  //   })
  // }
  // editNotifSubmit(classeuuid:string,notifTosend: any,update:boolean,task:number) {
  //   this.teacherservice.editclassnotif(classeuuid, notifTosend,task).subscribe({
  //     next: data => {
  //       console.log("editclassnotif from dash: ", data);
  //        if(update) this.events.changeTaskState({ task: this.events.TASKUPDATECLASSNOTIF, data: { tasktype: 2, classid: this.chosenClass.uuid, notif: data.notif } });
  //     },
  //     error: err => {
  //       console.log('err');
  //       console.log(err);
  //     }
  //   });
  // }
  gettodayCalender() {
    const todayDate = new Date();
    let nextDate: Date = null as any;
    let date: Date;
    this.classes.forEach((classe:any,indd)=>{
      let todayCount = 0;
      classe.data.events.forEach((event: any) => {
        date = new Date(event.start);
        if (
          date.getDate() === todayDate.getDate() &&
          date.getMonth() === todayDate.getMonth() &&
          date.getFullYear() === todayDate.getFullYear()
        ) todayCount++;
        if (date.getTime() > todayDate.getTime()) {
          if (!nextDate || date.getTime() < nextDate.getTime()) nextDate = date;
        }
      })
      this.selectedEventCount[indd]=classe.data.events.length;
      this.selectedEventCounttoday[indd]=todayCount;
      // this.selectednextEvent[indd]=nextDate;
    })
    // console.log("todayCount :   ",todayCount);
    

  }
  updateventcount(date:any,indd:number,addnotedit:boolean){
    const todayDate = new Date();
    // let nextDate: Date = this.selectednextEvent[indd];
    if(addnotedit)this.selectedEventCount[indd]++;
    if (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    )this.selectedEventCounttoday[indd]++;
    // if ( date.getTime() < nextDate.getTime())this.selectednextEvent[indd]=date;

  }
  getconnectedchaters(uuid: string) {
    this.authService.getconnectedchatters(this.classes.find(cl => cl.uuid == uuid).enrollers.map((e: any) => e.email)).subscribe({
      next: (data: any) => {
        this.connectedCount = 0;
        const forclass = this.classes.find(cl => cl.uuid == uuid);
        this.usersCount = forclass.enrollers.length;
        if (forclass) {
          data.forEach((elem: any) => {
            const userr = forclass.enrollers.find((user: any) => elem.user == user.email);
            if (elem.date == -1) this.connectedCount++;
            if (userr) userr.OnlineStat = elem.date;
          })
        }
        this.events.changeTaskState({ task: this.events.TASKCONNECTEDRECIEVED, data: { chosenClass: forclass, connectedfor: uuid } })

      },
      error: (err) => {
        console.log("err");
        console.log(err);
      }
    })
  }
  removeNotif(notifToDelete:number) {
    console.log("removeNotif",notifToDelete);
    
    // TODO add confirmation dialog 
    this.teacherservice.removeclassnotif(this.chosenClass.uuid, notifToDelete).subscribe({
      next: data => {
        console.log("removeclassnotif : ", data);
        this.events.changeTaskState({ task: this.events.TASKUPDATECLASSNOTIF, data: { tasktype: 3, classid: this.chosenClass.uuid, notifId: notifToDelete } });
      },
      error: err => {
        console.log('err');
        console.log(err);
      }
    });
  }
  chooseClass(id: number) {
    if (this.chosenIndex != id) {
      this.events.changeTaskState({ task: this.events.TASKCHOOSECLASSES, data: { chosenIndex: id, chosenClass: this.classes[id] } })
      this.getconnectedchaters(this.classes[id].uuid);
    } else {
      this.events.changeTaskState({ task: this.events.TASKCHOOSECLASSES, data: { chosenIndex: -1, chosenClass: null } })
    }
  }
  testt(){
    console.log("notifschedule = ");
    this.classes.forEach((classe:any,indd)=>{
      classe.data.notifschedule.forEach((nttf:any) => {
        console.log("classe name = ",classe.name);
        console.log("notif = ",nttf);
      })});
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
  }
  openModel(issAdd: boolean) {
    this.addnotEdit = issAdd;
    if (issAdd) {
      this.form = { class: '', subject: '1', }
    }
    this.blockHostListener = true;
    setTimeout(() => {
      this.blockHostListener = false;
    }, 300);
    this.modelShowen = true;
    setTimeout(() => {
      this.fadeModel = true;
    }, 10);
  }
  closeModel() {
    this.fadeModel = false;
    setTimeout(() => {
      this.modelShowen = false;
    }, 150);
  }
  submitModal() {
    if (this.form.class === '') this.form.class = parsesubject(+this.form.subject) + ' Class';
    this.loadingClasses=true;
    this.subscription2 = this.teacherservice.addclass(this.form.class, +this.form.subject).subscribe({
      next: data => {
        console.log("getClasses",data);
        this.classesCount=data.count;
        let tempp=this.user.info;
        tempp.classesCount=this.classesCount;
        this.storageService.alterUser({info:tempp});
        // TODO add loading fase + push only new class
        this.getclasses(false);
      },
      error: err => {
        console.log(err);
        // TODO - handle errors 
      }
    })
    console.log("submit", this.form);
    this.closeModel();
  }
  parsesubject(subject: number): string {
    return parsesubject(subject);
  }
  parsesubjectIcon(subject: number): string {
    return parsesubjectIcon(subject);
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.modalDialog.nativeElement.contains(event.target) && !this.blockHostListener && this.modelShowen) {
      this.closeModel();
    }
  }

}
