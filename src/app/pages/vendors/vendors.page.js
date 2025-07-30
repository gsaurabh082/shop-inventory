import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-vendors',
  templateUrl: 'vendors.page.html'
})
export class VendorsPage {
  vendors = [];

  constructor(inventoryService, alertController) {
    this.inventoryService = inventoryService;
    this.alertController = alertController;
    this.loadVendors();
  }

  loadVendors() {
    this.inventoryService.getVendors().subscribe(vendors => this.vendors = vendors);
  }

  async addVendor() {
    const alert = await this.alertController.create({
      header: 'Add Vendor',
      inputs: [
        { name: 'name', placeholder: 'Vendor Name' },
        { name: 'contact', placeholder: 'Contact Number' },
        { name: 'address', placeholder: 'Address' }
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.name) {
              this.inventoryService.addVendor(data.name, data.contact || '', data.address || '');
            }
          }
        }
      ]
    });
    await alert.present();
  }
}