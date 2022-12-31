import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './pages/root/root.component';

const routes: Routes = [
  {
    path: '', component: RootComponent,
   /* children: [
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
  ]*/
},
  //{path: 'log_in', component: LoginComponent},
 // {path: 'sign_up', component: RegisterComponent},
  //{path: '', redirectTo: '/home', pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
