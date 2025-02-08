import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';
import { SignInComponent } from './components/components/sign-in/sign-in.component';
import { HomeComponent } from './components/components/home/home.component';
import { LegalComponent } from './components/components/legal/legal.component';
import { ReportComponent } from './components/components/report/report.component';
import { InformationComponent } from './components/components/information/information.component';
import { AboutUsComponent } from './components/components/about-us/about-us.component';

export const routes: Routes = [
  
  { path: 'signup', component: SignUpComponent },
  { path: '', redirectTo: '/signup', pathMatch: 'full' }, // Default route
  { path: 'sign-in', component: SignInComponent},
  { path: 'home', component: HomeComponent},
  { path: 'legal', component: LegalComponent},
  { path: 'report', component: ReportComponent},
  { path: 'information', component: InformationComponent},
  { path: 'aboutus', component: AboutUsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
