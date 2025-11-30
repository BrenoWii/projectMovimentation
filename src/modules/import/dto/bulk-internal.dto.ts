// Internal DTO used by ImportService.bulkCreate
// This is the format after controller mapping
export interface BulkInternalItemDto {
  date: string;
  value: number;
  classificationId: number;
  payDate?: string;
  paymentMethod?: string;
  originalDescription?: string;
  learnMapping?: boolean;
}
