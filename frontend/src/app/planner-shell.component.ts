import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { ReturnsAssumptionComponent } from './tabs/returns-assumption/returns-assumption';
import { CashFlowsComponent } from './tabs/cash-flows/cash-flows';
import { NetWorthComponent } from './tabs/net-worth/net-worth';
import { RealEstateComponent } from './tabs/real-estate/real-estate';
import { DomesticEquityComponent } from './tabs/domestic-equity/domestic-equity';
import { UsEquityComponent } from './tabs/us-equity/us-equity';
import { DebtComponent } from './tabs/debt/debt';
import { GoldComponent } from './tabs/gold/gold';
import { CryptoComponent } from './tabs/crypto/crypto';
import { MiscellaneousComponent } from './tabs/miscellaneous/miscellaneous';
import { FinancialGoalsComponent } from './tabs/financial-goals/financial-goals';

@Component({
  selector: 'app-planner-shell',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    ReturnsAssumptionComponent,
    CashFlowsComponent,
    NetWorthComponent,
    RealEstateComponent,
    DomesticEquityComponent,
    UsEquityComponent,
    DebtComponent,
    GoldComponent,
    CryptoComponent,
    MiscellaneousComponent,
    FinancialGoalsComponent,
  ],
  templateUrl: './planner-shell.component.html',
})
export class PlannerShellComponent {}
