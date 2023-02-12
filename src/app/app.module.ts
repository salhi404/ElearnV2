import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { RootComponent } from './pages/root/root.component';
import { IconsModule } from 'app/icons/icons.module';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { MsgDDComponent } from './components/msg-dd/msg-dd.component';
import { NtfDDComponent } from './components/ntf-dd/ntf-dd.component';
import { UserDDComponent } from './components/user-dd/user-dd.component';
import { ThemeSwitchComponent } from './components/theme-switch/theme-switch.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { SpinnerComponent } from './components/spinner/spinner/spinner.component';
import { EmailComponent } from './pages/email/email.component';
import { HomeComponent } from './pages/home/home.component';
import { ErrorsComponent } from './pages/errors/errors.component';
import { HomeBtnComponent } from './components/home-btn/home-btn.component';
import { SceletonLoadComponent } from './components/sceleton-load/sceleton-load.component';
import { ChatComponent } from './pages/chat/chat.component';
import { InterfaceComponent } from './pages/interface/interface.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ProfileComponent } from './pages/profile/profile.component';
//import { FileUploadModule } from 'ng2-file-upload';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ProfileSettingComponent } from './components/profile-setting/profile-setting.component';
import { ProfileImageComponent } from './components/profile-image/profile-image.component';
import { ModDashboardComponent } from './pages/mod-dashboard/mod-dashboard.component';
import { DataTablesModule } from "angular-datatables";
import { UsersModComponent } from './pages/mod-pages/users-mod/users-mod.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RootComponent,
    SidebarComponent,
    MsgDDComponent,
    NtfDDComponent,
    UserDDComponent,
    ThemeSwitchComponent,
    LoginComponent,
    RegisterComponent,
    FooterComponent,
    SpinnerComponent,
    EmailComponent,
    HomeComponent,
    ErrorsComponent,
    HomeBtnComponent,
    SceletonLoadComponent,
    ChatComponent,
    InterfaceComponent,
    CalendarComponent,
    NotificationsComponent,
    ProfileComponent,
    ProfileSettingComponent,
    ProfileImageComponent,
    ModDashboardComponent,
    UsersModComponent,
  ],
  imports: [
    FullCalendarModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    IconsModule,
    BrowserModule,
    AppRoutingModule,
    //FileUploadModule,
    ImageCropperModule,
    DataTablesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
