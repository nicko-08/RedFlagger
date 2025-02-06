import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SignUpComponent } from './components/components/sign-up/sign-up.component';

export const routes: Routes = [
  { path: 'signup', component: SignUpComponent },
  { path: '', redirectTo: '/signup', pathMatch: 'full' } // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
