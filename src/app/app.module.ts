import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { RootComponent } from './pages/root/root.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { MsgDDComponent } from './components/msg-dd/msg-dd.component';
import { NtfDDComponent } from './components/ntf-dd/ntf-dd.component';
import { UserDDComponent } from './components/user-dd/user-dd.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RootComponent,
    SidebarComponent,
    MsgDDComponent,
    NtfDDComponent,
    UserDDComponent
  ],
  imports: [
    IconsModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
