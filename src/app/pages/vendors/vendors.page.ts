import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GMBTransactionService } from '../../services/gmb-transaction.service';
import { Vendor } from '../../models/inventory.model';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.page.html',
  styleUrls: ['./vendors.page.scss'],
})
export class VendorsPage implements OnInit {
  vendors: Vendor[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private gmbTransactionService: GMBTransactionService
  ) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.gmbTransactionService.getVendors().subscribe(vendors => {
      this.vendors = vendors;
    });
  }

  async addVendor() {
    const alert = await this.alertController.create({
      header: 'Add Vendor',
      inputs: [
        { name: 'name', type: 'text' as const, placeholder: 'Vendor Name' },
        { name: 'contact', type: 'text' as const, placeholder: 'Contact Number' },
        { name: 'address', type: 'text' as const, placeholder: 'Address' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.name) {
              const vendor = new Vendor(
                this.gmbTransactionService.generateId(),
                data.name,
                data.contact || '',
                data.address || ''
              );
              await this.gmbTransactionService.addVendor(vendor);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async editVendor(vendor: Vendor) {
    const alert = await this.alertController.create({
      header: 'Edit Vendor',
      inputs: [
        { name: 'name', type: 'text' as const, placeholder: 'Vendor Name', value: vendor.name },
        { name: 'contact', type: 'text' as const, placeholder: 'Contact Number', value: vendor.contact },
        { name: 'address', type: 'text' as const, placeholder: 'Address', value: vendor.address }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: async (data) => {
            if (data.name) {
              await this.gmbTransactionService.updateVendor(vendor.id, {
                name: data.name,
                contact: data.contact || '',
                address: data.address || ''
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteVendor(vendor: Vendor) {
    const alert = await this.alertController.create({
      header: 'Delete Vendor',
      message: `Delete ${vendor.name}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            await this.gmbTransactionService.deleteVendor(vendor.id);
          }
        }
      ]
    });
    await alert.present();
  }

  viewVendor(vendor: Vendor) {
    this.router.navigate(['/vendor', vendor.id]);
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'zero';
  }

  getBalanceStatus(balance: number): string {
    if (balance > 0) return 'They owe you';
    if (balance < 0) return 'You owe them';
    return 'Settled';
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}