# EBC HQ Accounting - Complete Church Management System

A comprehensive, keyboard-driven accounting and financial management system designed for Emmanuel Baptist Church headquarters and all branch churches. Features multi-church support, consolidated reporting, complete financial management, statutory compliance, and comprehensive reporting capabilities.

## Features

### Core Modules
- **Multi-Church Management** - HQ Lamka oversees all branch churches with complete data isolation
- **Company Management** - Multi-company support, financial year management, backup & restore
- **User & Security** - Role-based access control, audit trail, data encryption
- **Chart of Accounts** - Groups, Ledgers, Opening balances, GST applicability
- **Voucher Management** - Double-entry system, all voucher types (Contra, Payment, Receipt, Journal)
- **Consolidated Reports** - HQ can view and compare all churches' financial data
- **Banking** - Bank reconciliation, cheque printing, payment advice
- **Taxation** - GST (GSTR-1, GSTR-3B), TDS, TCS compliance
- **Reporting** - Trial Balance, P&L, Balance Sheet, Cash Flow, and 50+ reports
- **Multi-Currency** - Forex handling, exchange rate management
- **Audit & Compliance** - Complete audit trail, voucher verification

### UI/UX Features
- **Keyboard-driven navigation** - F2 for date, F4-F9 for vouchers, Alt+C for create
- **Real-time updates** - Instant posting, no batch processing
- **Church hierarchy** - HQ Lamka headquarters with complete oversight
- **Data isolation** - Each church has separate, secure ledgers

## Technology Stack
- **Frontend**: Next.js 15 (Page Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **UI**: shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ebc-accounting
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

See `DEPLOYMENT_GUIDE.md` and `BUILD_DEPLOY.md` for detailed deployment instructions.

### Quick Deploy to Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Import to Vercel and add environment variables
# Deploys automatically
```

## Usage

### Initial Setup
1. Register an account
2. Create HQ Lamka company (check "This is HQ/Headquarters")
3. Create branch churches (each with unique church code)
4. Set up chart of accounts for each church
5. Start entering vouchers

### HQ Lamka Features
- View all churches' data
- Access consolidated reports via Gateway Menu
- Compare churches side-by-side
- Generate combined reports for auditors

### Keyboard Shortcuts
- **F4** - Payment Voucher
- **F5** - Receipt Voucher
- **F6** - Contra Voucher
- **F7** - Journal Voucher
- **Alt+L** - Ledgers
- **Alt+G** - Groups
- **Alt+C** - Company Selector
- **F2** - Date Picker
- **Ctrl+S** - Save
- **Escape** - Cancel

## Project Structure
```
src/
├── components/       # React components
├── pages/           # Next.js pages
├── services/        # API services
├── integrations/    # Supabase integration
├── hooks/           # Custom hooks
└── styles/          # Global styles
```

## License
Private - Emmanuel Baptist Church

## Support
For technical support, contact the development team.