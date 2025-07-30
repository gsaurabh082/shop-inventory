export class Vendor {
  id: string;
  name: string;
  contact: string;
  address: string;
  balance: number;
  createdAt: Date;

  constructor(id: string, name: string, contact: string, address: string) {
    this.id = id;
    this.name = name;
    this.contact = contact;
    this.address = address;
    this.balance = 0;
    this.createdAt = new Date();
  }
}

export class Transaction {
  id: string;
  vendorId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  notes?: string;
  date: Date;

  constructor(id: string, vendorId: string, type: 'debit' | 'credit', amount: number, description: string, notes?: string, date?: Date) {
    this.id = id;
    this.vendorId = vendorId;
    this.type = type;
    this.amount = amount;
    this.description = description;
    this.notes = notes;
    this.date = date || new Date();
  }
}