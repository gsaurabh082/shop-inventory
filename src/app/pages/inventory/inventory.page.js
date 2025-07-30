import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { InventoryService } from '../../services/inventory.service';
import { CATEGORIES } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory',
  templateUrl: 'inventory.page.html'
})
export class InventoryPage {
  inventory = [];
  vendors = [];

  constructor(inventoryService, alertController) {
    this.inventoryService = inventoryService;
    this.alertController = alertController;
    this.loadData();
  }

  loadData() {
    this.inventoryService.getInventory().subscribe(items => this.inventory = items);
    this.inventoryService.getVendors().subscribe(vendors => this.vendors = vendors);
  }

  async addItem() {
    const alert = await this.alertController.create({
      header: 'Add Item',
      inputs: [
        { name: 'name', placeholder: 'Item Name' },
        { name: 'category', type: 'text', placeholder: 'Category (Sugar/Khowa/etc)' },
        { name: 'quantity', type: 'number', placeholder: 'Quantity' },
        { name: 'unit', placeholder: 'Unit (kg/ltr/pcs)' },
        { name: 'price', type: 'number', placeholder: 'Price per unit' }
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.name && data.category) {
              this.inventoryService.addItem(
                data.name, data.category, 
                parseFloat(data.quantity) || 0,
                data.unit || 'pcs',
                parseFloat(data.price) || 0,
                this.vendors[0]?.id || 'default'
              );
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async editItem(item) {
    const alert = await this.alertController.create({
      header: 'Update Quantity',
      inputs: [
        { name: 'quantity', type: 'number', value: item.quantity, placeholder: 'New Quantity' }
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Update',
          handler: (data) => {
            const change = parseFloat(data.quantity) - item.quantity;
            this.inventoryService.updateQuantity(item.id, change);
          }
        }
      ]
    });
    await alert.present();
  }
}