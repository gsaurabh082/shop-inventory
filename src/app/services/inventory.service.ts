import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { InventoryItem, Vendor, Transaction, DailyReport } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
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
    const inventory = await this.storage.get('inventory') || [];
    const vendors = await this.storage.get('vendors') || [];
    const transactions = await this.storage.get('transactions') || [];
    
    this.inventorySubject.next(inventory);
    this.vendorsSubject.next(vendors);
    this.transactionsSubject.next(transactions);
  }

  getInventory(): Observable<InventoryItem[]> {
    return this.inventorySubject.asObservable();
  }

  getVendors(): Observable<Vendor[]> {
    return this.vendorsSubject.asObservable();
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  async addInventoryItem(item: InventoryItem) {
    const inventory = this.inventorySubject.value;
    inventory.push(item);
    await this.storage.set('inventory', inventory);
    this.inventorySubject.next(inventory);
  }

  async updateInventoryItem(item: InventoryItem) {
    const inventory = this.inventorySubject.value;
    const index = inventory.findIndex(i => i.id === item.id);
    if (index !== -1) {
      inventory[index] = item;
      await this.storage.set('inventory', inventory);
      this.inventorySubject.next(inventory);
    }
  }

  async addVendor(vendor: Vendor) {
    const vendors = this.vendorsSubject.value;
    vendors.push(vendor);
    await this.storage.set('vendors', vendors);
    this.vendorsSubject.next(vendors);
  }

  async addTransaction(transaction: Transaction) {
    const transactions = this.transactionsSubject.value;
    transactions.push(transaction);
    await this.storage.set('transactions', transactions);
    this.transactionsSubject.next(transactions);

    if (transaction.type === 'purchase' && transaction.itemId) {
      await this.updateInventoryQuantity(transaction.itemId, transaction.quantity!);
    } else if (transaction.type === 'sale' && transaction.itemId) {
      await this.updateInventoryQuantity(transaction.itemId, -transaction.quantity!);
    }
  }

  private async updateInventoryQuantity(itemId: string, quantityChange: number) {
    const inventory = this.inventorySubject.value;
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      item.quantity += quantityChange;
      item.lastUpdated = new Date();
      await this.updateInventoryItem(item);
    }
  }

  getDailyReport(date: Date): DailyReport {
    const transactions = this.transactionsSubject.value.filter(t => 
      t.date.toDateString() === date.toDateString()
    );

    return {
      date,
      totalSales: transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0),
      totalPurchases: transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0),
      totalCredit: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
      totalPayments: transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0),
      transactions
    };
  }
}