/** Shape of the JSONB `data` column in the document table */
export interface DocumentData {
  customerName?: string;
  customerAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  notes?: string;
  items?: DocumentDataItem[];
}

export interface DocumentDataItem {
  productId?: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
