export interface PurchaseItem {
  id: string;
  transaction_date: string;
  product_name: string;
  management_code?: string;
  url?: string;
  identification_type?: string;
  identification_number?: string;
  quantity: number;
  price: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  invoice_number?: string;
  client_name?: string;
  client_company_name?: string;
  client_postal_code?: string;
  client_address?: string;
  client_occupation?: string;
  client_age?: number;
}

export interface SalesItem {
  id: string;
  transaction_date: string;
  product_name: string;
  management_code: string;
  url?: string;
  identification_type?: string;
  identification_number?: string;
  quantity: number;
  price: number;
  import_tax: number;
  final_value_fee: number;
  international_fee: number;
  tax: number;
  total_amount: number;
  shipping_cost: number;
  client_name?: string;
  client_company_name?: string;
  client_postal_code?: string;
  client_address?: string;
  client_occupation?: string;
  client_age?: number;
}

export interface ExpenseItem {
  id: string;
  transaction_date: string;
  product_name: string;
  detail?: string;
  price: number;
  tax: number;
  total_amount: number;
  shipping_cost: number;
  url?: string;
  client_name?: string;
  client_company_name?: string;
  client_postal_code?: string;
  client_address?: string;
  client_occupation?: string;
  client_age?: number;
}

export type AccountingItemBase = {
  id: string;
  transaction_date: string;
  product_name: string;
  price: number;
  total_amount: number;
} 