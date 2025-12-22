# CRM System for PT. Smart

A full-stack Customer Relationship Management system built for PT. Smart (ISP Company) to support their digital transformation.

## Features

### Mandatory Features
1. **User Authentication**
   - Login with JWT authentication
   - Role-based access (Sales & Manager)
   - Session management

2. **Leads Management**
   - CRUD operations for leads
   - Lead status tracking (new, contacted, qualified, converted)
   - Sales can only see their own leads
   - Managers can see all leads

3. **Product Management**
   - CRUD operations for internet packages
   - Automatic price calculation (HPP + Margin)
   - Only managers can modify products

4. **Project/Deal Pipeline**
   - Convert leads to customers
   - Support multiple products per transaction
   - Price negotiation with approval system
   - Status: waiting approval, approved, rejected

5. **Active Customers**
   - View subscribed customers
   - Multiple services per customer
   - Customer service management

6. **Reporting**
   - Sales performance reports
   - Lead conversion analytics
   - Export to Excel
   - Date-based filtering

### Additional Features
- Responsive dashboard with charts
- Real-time notifications
- Excel export functionality
- Docker containerization
- Role-based navigation

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **Next.js 14** (React framework)
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Hook Form** for forms
- **Axios** for API calls

### Deployment
- **Docker** & **Docker Compose**
- PostgreSQL container
- Ready for cloud deployment (Heroku, Vercel, Railway, etc.)

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Method 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/namadepan_crm.git
   cd namadepan_crm