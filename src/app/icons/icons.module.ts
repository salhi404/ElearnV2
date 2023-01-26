import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';



import { AlignJustify, Maximize, Monitor,Briefcase,Command,Mail,Copy,ShoppingBag,File,Layout,Grid,PieChart,Feather
        ,Image,Flag,Sliders,Map,MapPin,UserCheck,Anchor,ChevronsDown,AlertTriangle,Bell,ArrowDownCircle, XCircle,MessageCircle,Calendar } from 'angular-feather/icons';

const icons = {
  AlignJustify,
  Maximize,
  Monitor,
  Briefcase,
  Command,Mail,Copy,ShoppingBag,File,Layout,Grid,PieChart,Feather
  ,Image,Flag,Sliders,Map,MapPin,UserCheck,Anchor,ChevronsDown,AlertTriangle,Bell,ArrowDownCircle,XCircle,MessageCircle,Calendar
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
