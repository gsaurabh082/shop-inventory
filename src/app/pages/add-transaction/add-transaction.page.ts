import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GMBTransactionService } from '../../services/gmb-transaction.service';
import { Vendor, Transaction } from '../../models/inventory.model';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.page.html',
  styleUrls: ['./add-transaction.page.scss'],
})
export class AddTransactionPage implements OnInit {
  vendors: Vendor[] = [];
  selectedVendorId: string = '';
  amount: number = 0;
  description: string = '';
  notes: string = '';
  transactionType: 'credit' | 'debit' = 'credit';
  transactionDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gmbTransactionService: GMBTransactionService
  ) {}

  ngOnInit() {
    this.transactionDate = new Date().toISOString().split('T')[0];
    this.selectedVendorId = this.route.snapshot.queryParams['vendorId'] || '';
    this.transactionType = this.route.snapshot.queryParams['type'] || 'credit';
    this.loadVendors();
  }

  loadVendors() {
    this.gmbTransactionService.getVendors().subscribe(vendors => {
      this.vendors = vendors;
      if (!this.selectedVendorId && vendors.length > 0) {
        this.selectedVendorId = vendors[0].id;
      }
    });
  }

  async addTransaction() {
    if (!this.selectedVendorId || !this.amount || !this.description) {
      return;
    }

    const transaction = new Transaction(
      this.gmbTransactionService.generateId(),
      this.selectedVendorId,
      this.transactionType,
      this.amount,
      this.description,
      this.notes,
      new Date(this.transactionDate)
    );

    await this.gmbTransactionService.addTransaction(transaction);
    this.router.navigate(['/vendor', this.selectedVendorId]);
  }

  getSelectedVendor(): Vendor | undefined {
    return this.vendors.find(v => v.id === this.selectedVendorId);
  }
}