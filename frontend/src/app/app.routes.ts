import { Routes } from '@angular/router';
import { PlannerShellComponent } from './planner-shell.component';
import { FidokComponent } from './tools/fidok/fidok.component';

export const routes: Routes = [
  { path: '',       component: PlannerShellComponent },
  { path: 'fidok',  component: FidokComponent },
];
