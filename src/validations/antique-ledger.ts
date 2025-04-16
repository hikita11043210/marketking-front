import * as z from "zod";

export const transactionSchema = z.object({
  transaction_date: z.string().min(1, "取引年月日は必須です"),
  transaction_type: z.string().min(1, "取引区分は必須です"),
  product_name: z.string().min(1, "品名は必須です"),
  management_code: z.string().optional(),
  url: z.string().optional(),
  identification_type: z.string().default("運転免許証"),
  identification_number: z.string().default("12345"),
  quantity: z.coerce.number().min(1, "数量は1以上を入力してください").default(1),
  price: z.coerce.number().min(0, "代価は0以上を入力してください").default(0),
  client_name: z.string().optional(),
  client_company_name: z.string().optional(),
  client_postal_code: z.string().optional(),
  client_address: z.string().optional(),
  client_occupation: z.string().optional(),
  client_age: z.coerce.number().min(0, "年齢は0以上を入力してください").nullable().optional(),
}); 