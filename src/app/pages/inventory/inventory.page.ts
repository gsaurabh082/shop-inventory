import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss']
})
export class InventoryPage implements OnInit {
  totalItems = 87;
  inStockItems = 65;
  lowStockItems = 15;
  outOfStockItems = 7;

  constructor(
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  refreshData() {
    // Implement refresh logic
    console.log('Refreshing inventory data...');
  }

  async addNewItem() {
    const alert = await this.alertController.create({
      header: 'Add New Item',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Item Name' },
        { name: 'category', type: 'text', placeholder: 'Category' },
        { name: 'quantity', type: 'number', placeholder: 'Initial Quantity' },
        { name: 'unit', type: 'text', placeholder: 'Unit (kg, pieces, etc.)' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.name && data.category) {
              console.log('Adding item:', data);
              // Implement add item logic
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async updateStock() {
    const alert = await this.alertController.create({
      header: 'Update Stock',
      message: 'This feature will allow you to update stock levels for existing items.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async viewLowStock() {
    const alert = await this.alertController.create({
      header: 'Low Stock Items',
      message: 'Items that are running low on stock will be displayed here.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async viewCategories() {
    const alert = await this.alertController.create({
      header: 'Item Categories',
      message: 'View and manage item categories: Sugar, Khowa, Chenna, Gas, Grocery, Vegetables',
      buttons: ['OK']
    });
    await alert.present();
  }
}