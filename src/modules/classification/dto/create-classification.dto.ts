export class CreateClassificationDto {
  description: string;
  type: string;
  // Optional: link an existing PlanOfBills by id during creation
  planOfBillId?: string;
}
