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
      component: ModDashboardComponent
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
