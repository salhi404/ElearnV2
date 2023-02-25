import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { User } from 'app/Interfaces/user';
import { filter, Subject, Subscription } from 'rxjs';
import { StorageService } from 'app/_services/storage.service';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { AuthService } from 'app/_services/auth.service';
import { TeacherService } from 'app/_services/teacher.service';
import { EventsService } from 'app/services/events.service';
import { parsegrade, parseroles, getmainrole, getmainrolecode, parsesubject, parsesubjectIcon } from 'app/functions/parsers';
@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})

export class TeacherDashboardComponent implements OnInit, OnDestroy {
  user: User = null as any;
  classes: any[] = [];
  roles: string[] = [];
  mainRole: String = '';
  mainRolecode: number = -1;
  subscription: Subscription = new Subscription();
  subscription1: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  subscription3: Subscription = new Subscription();
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
  selectedEventCount: number[] = [];
  selectedEventCounttoday: number[] = [];
  form: any = {
    class: '',
    subject: 1,
  }
  @ViewChild("modalDialog") modalDialog!: ElementRef;
  constructor(private storageService: StorageService, private authService: AuthService, private teacherservice: TeacherService, private events: EventsService, private router: Router) { }
  ngOnInit(): void {

    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      switch (this.router.url) {
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
        default:
          this.activeroute = -1
          break;
      }
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
      /*this.subscription1=this.events.modinfostatusEvent.subscribe(state=>{
        if(state.usersCount){
          this.usersCount=state.usersCount;
        }
        if(state.connectedCount){
          this.connectedCount=state.connectedCount;
        }
      })*/

      this.subscription3 = this.events.taskEvent.subscribe(state => {
        if (state.task == this.events.TASKOPENMODAL) {
          this.openModel(true)
        }
        if (state.task == this.events.TASKGETCLASSES) {
          this.getclasses(true);
        }
        if (state.task == this.events.TASKCHOOSECLASSES) {
          this.chosenIndex = state.data.chosenIndex;
          this.chosenClass = state.data.chosenClass;
        }
        if (state.task == this.events.TASKREFRESHCONNECTED) {
          this.getconnectedchaters(state.data.uuid);
        }
        if (state.task == this.events.TASKGETCHOSENCLASS) {
          this.events.changeTaskState({ task: this.events.TASKCHOOSECLASSES, data: { chosenIndex: this.chosenIndex, chosenClass: this.chosenClass } })
        }


      })


      this.getclasses(false); // TODO - implement reload with socket or add a button 


    } else {
      this.navigationExtras = { state: { errorNbr: 403 } };
      this.router.navigate(['/error'], this.navigationExtras);
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

  }
  getclasses(refresh: boolean) {
    this.subscription1 = this.teacherservice.getClasses().subscribe({
      next: data => {
        console.log("getClasses");
        console.log(data);
        // this.attemptogetClasses++;
        if (data.classes) {
          this.classes = data.classes;
          console.log("this.classes before", this.classes);
          this.classes.sort(function (a, b) {
            return (new Date(a.created).getTime()) - (new Date(b.created).getTime());
          });
          this.getTodeyCalender();
          console.log("this.classes after sort", this.classes);
          if (refresh) {
            this.events.changeclassInfoState({ state: 2, classes: this.classes });

          }
          else { this.events.changeclassInfoState({ state: 1, classes: this.classes }); }
         
        }
      },
      error: err => { console.log(err); }
    })
  }
  getTodeyCalender() {
    const todayDate = new Date();
   
    let nextDate: Date = null as any;
    let date: Date;
    this.classes.forEach((classe:any,indd)=>{
      let todeyCount = 0;
      classe.data.events.forEach((event: any) => {
        date = new Date(event.start);
        if (
          date.getDate() === todayDate.getDate() &&
          date.getMonth() === todayDate.getMonth() &&
          date.getFullYear() === todayDate.getFullYear()
        ) todeyCount++;
        if (date.getTime() > todayDate.getTime()) {
          if (!nextDate || date.getTime() < nextDate.getTime()) nextDate = date;
        }
      })
      this.selectedEventCount[indd]=classe.data.events.length;
      this.selectedEventCounttoday[indd]=todeyCount;
    })
    // console.log("todeyCount :   ",todeyCount);
    

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
  chooseClass(id: number) {
    if (this.chosenIndex != id) {
      this.events.changeTaskState({ task: this.events.TASKCHOOSECLASSES, data: { chosenIndex: id, chosenClass: this.classes[id] } })
      this.getconnectedchaters(this.classes[id].uuid);
    } else {
      this.events.changeTaskState({ task: this.events.TASKCHOOSECLASSES, data: { chosenIndex: -1, chosenClass: null } })
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
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
    this.subscription2 = this.teacherservice.addclass(this.form.class, +this.form.subject).subscribe({
      next: data => {
        console.log("getClasses");
        console.log(data);
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
