# Sweet Shop Inventory App

Ionic Android app for managing sweet shop inventory with daily transactions.

## Features
- **Inventory Management**: Track Sugar, Khowa, Chenna, Gas, Grocery, Vegetables
- **Vendor Management**: Multiple vendor support
- **Daily Transactions**: Sales, purchases, credit, payments
- **Reports**: Daily summaries and low stock alerts

## Setup
```bash
npm install
ionic serve
```

## Build for Android
```bash
ionic capacitor add android
ionic capacitor build android
ionic capacitor run android
```

## Usage
1. **Home**: Navigate to different sections
2. **Inventory**: Add/edit items and quantities
3. **Vendors**: Manage supplier information
4. **Transactions**: Record daily business activities
5. **Reports**: View summaries and alerts

## Data Storage
Uses Ionic Storage for local data persistence.