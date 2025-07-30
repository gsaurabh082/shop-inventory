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
  filteredVendors: Vendor[] = [];
  searchTerm = '';
  totalVendors = 0;
  totalOwed = 0;
  totalDue = 0;
  settledVendors = 0;
  Math = Math;

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
      this.updateStats();
      this.filterVendors();
    });
  }

  updateStats() {
    this.totalVendors = this.vendors.length;
    this.totalOwed = this.vendors.filter(v => v.balance > 0).reduce((sum, v) => sum + v.balance, 0);
    this.totalDue = Math.abs(this.vendors.filter(v => v.balance < 0).reduce((sum, v) => sum + v.balance, 0));
    this.settledVendors = this.vendors.filter(v => v.balance === 0).length;
  }

  filterVendors() {
    if (!this.searchTerm) {
      this.filteredVendors = this.vendors;
    } else {
      this.filteredVendors = this.vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vendor.contact.includes(this.searchTerm) ||
        vendor.address.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  async addVendor() {
    const alert = await this.alertController.create({
      header: 'Add New Vendor',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Vendor Name',
          attributes: { required: true }
        },
        {
          name: 'contact',
          type: 'text',
          placeholder: 'Contact Number'
        },
        {
          name: 'address',
          type: 'text',
          placeholder: 'Address'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.name && data.name.trim()) {
              const vendor = new Vendor(
                this.gmbTransactionService.generateId(),
                data.name.trim(),
                data.contact || '',
                data.address || ''
              );
              await this.gmbTransactionService.addVendor(vendor);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  viewVendor(vendorId: string) {
    this.router.navigate(['/vendor', vendorId]);
  }

  async viewActiveVendors() {
    const alert = await this.alertController.create({
      header: 'Active Vendors',
      message: 'View all vendors with ongoing transactions and active relationships.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async viewPendingPayments() {
    const alert = await this.alertController.create({
      header: 'Pending Payments',
      message: 'Review all outstanding payments and balances with vendors.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async bulkActions() {
    const alert = await this.alertController.create({
      header: 'Bulk Actions',
      message: 'Perform bulk operations like export data, send reminders, or update multiple vendors.',
      buttons: ['OK']
    });
    await alert.present();
  }
}