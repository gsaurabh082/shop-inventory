export const TRANSACTION_TYPES = ['debit', 'credit'];

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

export class VendorReport {
  vendorId: string;
  vendorName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  transactionCount: number;
  transactions: Transaction[];
  monthlyData: { month: string; debit: number; credit: number; balance: number }[];

  constructor(vendorId: string, vendorName: string, transactions: Transaction[]) {
    this.vendorId = vendorId;
    this.vendorName = vendorName;
    this.transactions = transactions;
    this.totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    this.totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    this.balance = this.totalDebit - this.totalCredit;
    this.transactionCount = transactions.length;
    this.monthlyData = this.calculateMonthlyData(transactions);
  }

  private calculateMonthlyData(transactions: Transaction[]) {
    const monthlyMap = new Map();
    
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().substring(0, 7);
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { debit: 0, credit: 0 });
      }
      const data = monthlyMap.get(monthKey);
      if (t.type === 'debit') data.debit += t.amount;
      else data.credit += t.amount;
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      debit: data.debit,
      credit: data.credit,
      balance: data.debit - data.credit
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
}