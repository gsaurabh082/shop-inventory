import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vendor, Transaction, VendorReport } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class GMBTransactionService {
  private vendorsSubject = new BehaviorSubject<Vendor[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
    await this.loadData();
  }

  private async loadData() {
    const vendors = await this.storage.get('vendors') || [];
    const transactions = await this.storage.get('transactions') || [];
    
    this.vendorsSubject.next(vendors);
    this.transactionsSubject.next(transactions);
  }

  getVendors(): Observable<Vendor[]> {
    return this.vendorsSubject.asObservable();
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  async addVendor(vendor: Vendor) {
    const vendors = this.vendorsSubject.value;
    vendors.push(vendor);
    await this.storage.set('vendors', vendors);
    this.vendorsSubject.next(vendors);
  }

  async addTransaction(transaction: Transaction) {
    const transactions = [...this.transactionsSubject.value];
    transactions.push(transaction);
    await this.storage.set('transactions', transactions);
    this.transactionsSubject.next(transactions);
    await this.updateVendorBalance(transaction.vendorId);
  }

  private async updateVendorBalance(vendorId: string) {
    const vendors = [...this.vendorsSubject.value];
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      const vendorTransactions = this.transactionsSubject.value.filter(t => t.vendorId === vendorId);
      const totalCredit = vendorTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
      const totalDebit = vendorTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
      vendor.balance = totalDebit - totalCredit;
      
      await this.storage.set('vendors', vendors);
      this.vendorsSubject.next(vendors);
    }
  }

  getVendorTransactions(vendorId: string): Transaction[] {
    return this.transactionsSubject.value.filter(t => t.vendorId === vendorId);
  }

  getVendorReport(vendorId: string): VendorReport | null {
    const vendor = this.vendorsSubject.value.find(v => v.id === vendorId);
    if (!vendor) return null;
    
    const transactions = this.getVendorTransactions(vendorId);
    return new VendorReport(vendorId, vendor.name, transactions);
  }

  getMonthlyReport(month: string): { vendors: VendorReport[]; totalDebit: number; totalCredit: number; totalBalance: number } {
    const startDate = new Date(month + '-01');
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const monthTransactions = this.transactionsSubject.value.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const vendorReports = this.vendorsSubject.value.map(vendor => {
      const vendorTransactions = monthTransactions.filter(t => t.vendorId === vendor.id);
      return new VendorReport(vendor.id, vendor.name, vendorTransactions);
    }).filter(report => report.transactionCount > 0);

    return {
      vendors: vendorReports,
      totalDebit: vendorReports.reduce((sum, r) => sum + r.totalDebit, 0),
      totalCredit: vendorReports.reduce((sum, r) => sum + r.totalCredit, 0),
      totalBalance: vendorReports.reduce((sum, r) => sum + r.balance, 0)
    };
  }

  async updateTransaction(transactionId: string, updatedData: any) {
    const transactions = this.transactionsSubject.value.map(t => {
      if (t.id === transactionId) {
        return { ...t, ...updatedData };
      }
      return t;
    });
    
    await this.storage.set('transactions', transactions);
    this.transactionsSubject.next(transactions);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      await this.updateVendorBalance(transaction.vendorId);
    }
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}