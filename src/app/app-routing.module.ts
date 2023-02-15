import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailComponent } from './pages/email/email.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RootComponent } from './pages/root/root.component';
import { ErrorsComponent } from './pages/errors/errors.component';
import { ChatComponent } from './pages/chat/chat.component';
import { InterfaceComponent } from './pages/interface/interface.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ModDashboardComponent } from './pages/mod-dashboard/mod-dashboard.component';
import { UsersModComponent } from './pages/mod-pages/users-mod/users-mod.component';
import { TeacherDashboardComponent } from './pages/teacher-pages/teacher-dashboard/teacher-dashboard.component';
import { TeacherEnrollersComponent } from './pages/teacher-pages/teacher-enrollers/teacher-enrollers.component';
import { TeacherEventsComponent } from './pages/teacher-pages/teacher-events/teacher-events.component';
import { TeacherNotificationsComponent } from './pages/teacher-pages/teacher-notifications/teacher-notifications.component';
import { TeacherLiveStreamComponent } from './pages/teacher-pages/teacher-live-stream/teacher-live-stream.component';
import { TeacherClassesComponent } from './pages/teacher-pages/teacher-classes/teacher-classes.component';
const routes: Routes = [
  {
    path: '', component: RootComponent,
    children: [
      {
        path: '',
        component:InterfaceComponent
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'email',
        component: EmailComponent
      },
      {
        path: 'chat',
        component: ChatComponent
      },
      {
        path: 'calendar',
        component: CalendarComponent
    },
    {
      path: 'notifications',
      component: NotificationsComponent
    },
    {
      path: 'profile',
      component: ProfileComponent
    },
    {
      path: 'mod-dashboard',
      component: ModDashboardComponent,
      children: [
        {
          path: '', redirectTo: '/mod-dashboard/users', pathMatch: 'full'
        },{
          path: 'users',
          component:UsersModComponent
        },{
          path: '**', redirectTo: '/home', pathMatch: 'full'
          // component:UsersModComponent
        },
        /*{
          path: 'home',
          component: HomeComponent
        }*/
      ]
      
    },
    {
      path: 'teacher-dashboard',
      component: TeacherDashboardComponent,
      children: [
        {
          path: '', redirectTo: '/teacher-dashboard/users', pathMatch: 'full'
        },{
          path: 'users',
          component:TeacherClassesComponent
        },{
          path: 'events',
          component:TeacherEventsComponent
        },{
          path: 'notifications',
          component:TeacherNotificationsComponent
        },{
          path: 'liveStreams',
          component:TeacherLiveStreamComponent
        },
        {
          path: '**', redirectTo: '/home', pathMatch: 'full'
          // component:UsersModComponent
        },
        /*{
          path: 'home',
          component: HomeComponent
        }*/
      ]
      
    },
  ]
},
{path: 'login', component: LoginComponent},
{path: 'signup', component: RegisterComponent},
{
  path: 'error', component: ErrorsComponent
},
//{path: '', redirectTo: '/home', pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
