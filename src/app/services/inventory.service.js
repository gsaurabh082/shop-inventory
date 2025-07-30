import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { InventoryItem, Vendor, Transaction, DailyReport } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(storage) {
    this.storage = storage;
    this.inventory = new BehaviorSubject([]);
    this.vendors = new BehaviorSubject([]);
    this.transactions = new BehaviorSubject([]);
    this.init();
  }

  async init() {
    await this.storage.create();
    await this.loadData();
  }

  async loadData() {
    const inventory = await this.storage.get('inventory') || [];
    const vendors = await this.storage.get('vendors') || [];
    const transactions = await this.storage.get('transactions') || [];
    
    this.inventory.next(inventory);
    this.vendors.next(vendors);
    this.transactions.next(transactions);
  }

  getInventory() { return this.inventory.asObservable(); }
  getVendors() { return this.vendors.asObservable(); }
  getTransactions() { return this.transactions.asObservable(); }

  async addItem(name, category, quantity, unit, price, vendorId) {
    const item = new InventoryItem(Date.now().toString(), name, category, quantity, unit, price, vendorId);
    const items = this.inventory.value;
    items.push(item);
    await this.storage.set('inventory', items);
    this.inventory.next(items);
  }

  async addVendor(name, contact, address) {
    const vendor = new Vendor(Date.now().toString(), name, contact, address);
    const vendors = this.vendors.value;
    vendors.push(vendor);
    await this.storage.set('vendors', vendors);
    this.vendors.next(vendors);
  }

  async addTransaction(type, amount, description, itemId = null, vendorId = null, quantity = null, date = null) {
    const transaction = new Transaction(Date.now().toString(), type, amount, description, itemId, vendorId, quantity, date);
    const transactions = this.transactions.value;
    transactions.push(transaction);
    await this.storage.set('transactions', transactions);
    this.transactions.next(transactions);

    if (type === 'purchase' && itemId) this.updateQuantity(itemId, quantity);
    if (type === 'sale' && itemId) this.updateQuantity(itemId, -quantity);
  }

  async updateQuantity(itemId, change) {
    const items = this.inventory.value;
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.quantity += change;
      item.lastUpdated = new Date();
      await this.storage.set('inventory', items);
      this.inventory.next(items);
    }
  }

  getDailyReport(date) {
    const dayTransactions = this.transactions.value.filter(t => 
      new Date(t.date).toDateString() === date.toDateString()
    );
    return new DailyReport(date, dayTransactions);
  }
}