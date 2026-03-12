import { Routes } from '@angular/router';
import { PlannerShellComponent } from './planner-shell.component';
import { FidokComponent } from './tools/fidok/fidok.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '',      component: PlannerShellComponent, canActivate: [authGuard] },
  { path: 'fidok', component: FidokComponent,        canActivate: [authGuard] },
];
