export interface TransactionType {
  id: number;
  value: string;
}

export interface Transaction {
  id: number;
  transaction_date: string;
  transaction_type: number;
  transaction_type_name: string;
  product_name: string;
  management_code: string;
  url: string;
  identification_type: string;
  identification_number: string;
  quantity: number;
  price: number;
  client_name: string;
  client_company_name: string;
  client_postal_code: string;
  client_address: string;
  client_occupation: string;
  client_age: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface TransactionFormValues {
  transaction_date: string;
  transaction_type: string;
  product_name: string;
  management_code: string;
  url: string;
  identification_type: string;
  identification_number: string;
  quantity: number;
  price: number;
  client_name: string;
  client_company_name: string;
  client_postal_code: string;
  client_address: string;
  client_occupation: string;
  client_age: number | null;
}

export interface TransactionsFilter {
  transaction_date?: string;
  transaction_type?: string;
  management_code?: string;
  search?: string;
  ordering?: string;
} 