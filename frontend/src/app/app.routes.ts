import { Routes } from '@angular/router';
import { PlannerShellComponent } from './planner-shell.component';
import { FireComponent } from './tools/fire/fire.component';
import { FidokComponent } from './tools/fidok/fidok.component';
import { FundsComponent } from './tools/funds/funds.component';
import { BudgetComponent } from './tools/budget/budget.component';

export const routes: Routes = [
  { path: '',       component: PlannerShellComponent },
  { path: 'fire',   component: FireComponent },
  { path: 'fidok',  component: FidokComponent },
  { path: 'funds',  component: FundsComponent },
  { path: 'budget', component: BudgetComponent },
];
