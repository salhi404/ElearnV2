import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailComponent } from './pages/email/email.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RootComponent } from './pages/root/root.component';

const routes: Routes = [
  {
    path: '', component: RootComponent,
    children: [
      {
        path: '', redirectTo: '/home', 
        pathMatch: 'full'
      },
      {
          path: 'home',
          component: HomeComponent
      },
      {
          path: 'email',
          component: EmailComponent
      }
  ]
},
{path: 'login', component: LoginComponent},
{path: 'signup', component: RegisterComponent},
//{path: '', redirectTo: '/home', pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
