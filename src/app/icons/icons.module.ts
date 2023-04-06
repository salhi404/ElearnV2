import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';



import {
  Home,AlignJustify, Maximize, Monitor,Briefcase,Command,Mail,Copy,ShoppingBag,File,Layout,Grid,
  PieChart,Feather,Image,Flag,Sliders,Map,MapPin,UserCheck,Anchor,ChevronsDown,AlertTriangle,Bell,
  ArrowDownCircle, XCircle,MessageCircle,Calendar,Minimize,Video
} from 'angular-feather/icons';

const icons = {
  Home,
  AlignJustify,Maximize,Monitor,Briefcase,Command,Mail,Copy,ShoppingBag,File,Layout,Grid,PieChart,Feather
  ,Image,Flag,Sliders,Map,MapPin,UserCheck,Anchor,ChevronsDown,AlertTriangle,Bell,ArrowDownCircle,XCircle,
  MessageCircle,Calendar,Minimize,Video
};
@NgModule({
  declarations: [],
  imports: [
    FeatherModule.pick(icons)
  ],
  exports: [
    FeatherModule
  ]
})
export class IconsModule { }
