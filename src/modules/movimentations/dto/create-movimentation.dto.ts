import { PlanOfBills } from "src/modules/plan-of-bills/plan-of-bills.entity";
import { User } from "src/modules/users/user.entity";

export class CreateMovimentationDto {
    date: Date;
    value: number;
    planOfBill: PlanOfBills;
    user: User;
    payDate: Date;
  }
