import { z } from "zod";

export const createReportedItemSchema = z.object({

});

export const updateReportedItemSchema = createReportedItemSchema.partial();

export type CreateReportedItemDto = z.infer<typeof createReportedItemSchema>;
export type UpdateReportedItemDto = z.infer<typeof updateReportedItemSchema>;