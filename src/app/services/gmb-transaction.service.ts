import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vendor, Transaction } from '../models/inventory.model';

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
    const vendors = [...this.vendorsSubject.value, vendor];
    await this.storage.set('vendors', vendors);
    this.vendorsSubject.next(vendors);
  }

  async updateVendor(vendorId: string, updates: any) {
    const vendors = this.vendorsSubject.value.map(v => 
      v.id === vendorId ? { ...v, ...updates } : v
    );
    await this.storage.set('vendors', vendors);
    this.vendorsSubject.next(vendors);
  }

  async deleteVendor(vendorId: string) {
    const vendors = this.vendorsSubject.value.filter(v => v.id !== vendorId);
    const transactions = this.transactionsSubject.value.filter(t => t.vendorId !== vendorId);
    
    await this.storage.set('vendors', vendors);
    await this.storage.set('transactions', transactions);
    
    this.vendorsSubject.next(vendors);
    this.transactionsSubject.next(transactions);
  }

  async addTransaction(transaction: Transaction) {
    const transactions = [...this.transactionsSubject.value, transaction];
    await this.storage.set('transactions', transactions);
    this.transactionsSubject.next(transactions);
    await this.updateVendorBalance(transaction.vendorId);
  }

  async updateTransaction(transactionId: string, updates: any) {
    const transactions = this.transactionsSubject.value.map(t => 
      t.id === transactionId ? { ...t, ...updates } : t
    );
    await this.storage.set('transactions', transactions);
    this.transactionsSubject.next(transactions);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      await this.updateVendorBalance(transaction.vendorId);
    }
  }

  async deleteTransaction(transactionId: string) {
    const transaction = this.transactionsSubject.value.find(t => t.id === transactionId);
    const transactions = this.transactionsSubject.value.filter(t => t.id !== transactionId);
    
    await this.storage.set('transactions', transactions);
    this.transactionsSubject.next(transactions);
    
    if (transaction) {
      await this.updateVendorBalance(transaction.vendorId);
    }
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

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}