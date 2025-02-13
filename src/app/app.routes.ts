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
import { PageInformationComponent } from './components/components/page-information/page-information.component';
import { EmailConfirmedComponent } from './components/components/email-confirmed/email-confirmed.component';
import { CheckEmailComponent} from './components/components/check-email/check-email.component';
export const routes: Routes = [
  
  { path: 'signup', component: SignUpComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default route
  { path: 'sign-in', component: SignInComponent},
  { path: 'home', component: HomeComponent},
  { path: 'legal', component: LegalComponent},
  { path: 'report', component: ReportComponent},
  { path: 'information', component: InformationComponent},
  { path: 'aboutus', component: AboutUsComponent},
  {path: "page-information", component: PageInformationComponent},
  {path: "email-confirmed", component: EmailConfirmedComponent},
  {path: "check-email", component: CheckEmailComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
