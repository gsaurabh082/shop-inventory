import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ActionSheetController, ModalController } from '@ionic/angular';
import { GMBTransactionService } from '../services/gmb-transaction.service';
import { Vendor, Transaction } from '../models/inventory.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  vendors: Vendor[] = [];
  transactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];
  topVendors: Vendor[] = [];
  
  totalVendors = 0;
  totalBalance = 0;
  todayTransactions = 0;
  monthlyTotal = 0;
  totalItems = 150;
  Math = Math;

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  navigateToInventory() {
    this.router.navigate(['/tabs/inventory']);
  }

  navigateToVendors() {
    this.router.navigate(['/tabs/vendors']);
  }

  navigateToTransactions() {
    this.router.navigate(['/tabs/transactions']);
  }

  navigateToReports() {
    this.router.navigate(['/tabs/reports']);
  }

  constructor(
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private gmbTransactionService: GMBTransactionService
  ) {}

  async ngOnInit() {
    await this.gmbTransactionService.init();
    this.loadData();
  }

  loadData() {
    this.gmbTransactionService.getVendors().subscribe(vendors => {
      this.vendors = vendors;
      this.updateStats();
    });

    this.gmbTransactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      this.updateStats();
    });
  }

  updateStats() {
    this.totalVendors = this.vendors.length;
    this.totalBalance = this.vendors.reduce((sum, v) => sum + v.balance, 0);
    
    const today = new Date().toDateString();
    this.todayTransactions = this.transactions.filter(t => 
      new Date(t.date).toDateString() === today
    ).length;

    const thisMonth = new Date().toISOString().substring(0, 7);
    this.monthlyTotal = this.transactions
      .filter(t => t.date.toISOString().substring(0, 7) === thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    this.topVendors = this.vendors
      .filter(v => v.balance !== 0)
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 5);
  }

  async showAddOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Add New',
      buttons: [
        {
          text: 'Add Vendor',
          icon: 'person-add-outline',
          handler: () => this.addVendor()
        },
        {
          text: 'Quick Transaction',
          icon: 'card-outline',
          handler: () => this.quickTransaction()
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async addVendor() {
    const alert = await this.alertController.create({
      header: 'Add New Vendor',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Vendor Name' },
        { name: 'contact', type: 'text', placeholder: 'Contact Number' },
        { name: 'address', type: 'text', placeholder: 'Address' }
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

  async quickTransaction() {
    const vendorAlert = await this.alertController.create({
      header: 'Select or Add Vendor',
      inputs: [
        ...this.vendors.map((v, index) => ({
          name: 'vendorId',
          type: 'radio' as const,
          label: v.name,
          value: v.id,
          checked: index === 0
        })),
        {
          name: 'vendorId',
          type: 'radio' as const,
          label: 'Add New Vendor',
          value: 'new',
          checked: this.vendors.length === 0
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next',
          handler: (vendorId) => {
            if (vendorId === 'new') {
              this.addNewVendorForTransaction();
            } else if (vendorId) {
              this.selectDateForTransaction(vendorId);
            }
          }
        }
      ]
    });
    await vendorAlert.present();
  }

  async addNewVendorForTransaction() {
    const alert = await this.alertController.create({
      header: 'Add New Vendor',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Vendor Name' },
        { name: 'contact', type: 'text', placeholder: 'Contact Number' },
        { name: 'address', type: 'text', placeholder: 'Address' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add & Continue',
          handler: async (data) => {
            if (data.name) {
              const vendor = new Vendor(
                this.gmbTransactionService.generateId(),
                data.name,
                data.contact || '',
                data.address || ''
              );
              await this.gmbTransactionService.addVendor(vendor);
              this.selectDateForTransaction(vendor.id);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async selectDateForTransaction(vendorId: string) {
    const { DatePickerComponent } = await import('../components/date-picker/date-picker.component');
    
    const modal = await this.modalController.create({
      component: DatePickerComponent,
      componentProps: {
        selectedDate: new Date().toISOString()
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'confirm') {
        const selectedDate = new Date(result.data).toISOString().split('T')[0];
        this.showTransactionForm(vendorId, selectedDate);
      }
    });

    await modal.present();
  }

  async showTransactionForm(vendorId: string, date: string) {
    const selectedDate = new Date(date);
    const existingTransaction = this.transactions.find(t => 
      t.vendorId === vendorId && 
      new Date(t.date).toDateString() === selectedDate.toDateString()
    );

    const alert = await this.alertController.create({
      header: `Transaction for ${selectedDate.toDateString()}`,
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Amount', value: existingTransaction?.amount?.toString() || '' },
        { name: 'description', type: 'text', placeholder: 'Description', value: existingTransaction?.description || '' },
        { name: 'notes', type: 'text', placeholder: 'Notes', value: existingTransaction?.notes || '' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Debit',
          cssClass: 'debit-button',
          handler: async (data) => {
            if (data.amount && data.description) {
              await this.processTransaction(vendorId, data, selectedDate, 'debit', existingTransaction);
              alert.dismiss();
            }
            return false;
          }
        },
        {
          text: 'Credit',
          cssClass: 'credit-button',
          handler: async (data) => {
            if (data.amount && data.description) {
              await this.processTransaction(vendorId, data, selectedDate, 'credit', existingTransaction);
              alert.dismiss();
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  async processTransaction(vendorId: string, data: any, date: Date, type: 'debit' | 'credit', existingTransaction?: any) {
    try {
      if (existingTransaction) {
        await this.gmbTransactionService.updateTransaction(existingTransaction.id, {
          amount: parseFloat(data.amount),
          description: data.description,
          notes: data.notes,
          type: type,
          date: date
        });
      } else {
        const transaction = new Transaction(
          this.gmbTransactionService.generateId(),
          vendorId,
          type,
          parseFloat(data.amount),
          data.description,
          data.notes || '',
          date
        );
        await this.gmbTransactionService.addTransaction(transaction);
      }
      
      setTimeout(() => {
        this.loadData();
      }, 100);
      
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }

  navigateToVendor(vendorId: string) {
    this.router.navigate(['/vendor', vendorId]);
  }

  getVendorName(vendorId: string): string {
    const vendor = this.vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  }

  getTransactionColor(type: string): string {
    return type === 'debit' ? 'danger' : 'success';
  }
}