#!/bin/bash

# Quick Deployment Script for Banking Platform Demo
# This script automates the entire free deployment process

set -e

echo "🏦 Banking Platform - Free Deployment Setup"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install deployment tools
install_tools() {
    print_step "Installing deployment tools..."
    
    # Install Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Install Railway CLI
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    print_success "Deployment tools installed"
}

# Setup simplified backend
setup_backend() {
    print_step "Setting up simplified backend for Railway..."
    
    # Create simplified backend directory
    mkdir -p backend-demo
    cp deployment/free-hosting/backend-simplified/* backend-demo/
    
    # Create minimal project structure
    cd backend-demo
    
    # Install dependencies
    dotnet restore
    
    print_success "Backend setup completed"
    cd ..
}

# Setup frontend for deployment
setup_frontend() {
    print_step "Preparing frontend for deployment..."
    
    cd frontend/banking-ui
    
    # Update package.json for Vercel
    npm install
    
    # Create production environment file
    cat > .env.production << EOF
REACT_APP_API_URL=https://banking-platform-api.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=Banking Platform Demo
REACT_APP_VERSION=1.0.0
EOF
    
    # Copy Vercel configuration
    cp ../../deployment/free-hosting/vercel-config/vercel.json .
    
    # Build to test
    npm run build
    
    print_success "Frontend preparation completed"
    cd ../..
}

# Deploy backend to Railway
deploy_backend() {
    print_step "Deploying backend to Railway..."
    
    cd backend-demo
    
    print_warning "Please complete the following steps manually:"
    echo "1. Login to Railway: railway login"
    echo "2. Create new project: railway project new"
    echo "3. Deploy: railway up"
    echo "4. Set environment variables in Railway dashboard:"
    echo "   - JWT_SECRET=your-secret-key-here"
    echo "   - DATABASE_URL=your-planetscale-url"
    echo "   - CORS_ORIGINS=https://your-vercel-app.vercel.app"
    
    read -p "Press Enter after completing Railway deployment..."
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_step "Deploying frontend to Vercel..."
    
    cd frontend/banking-ui
    
    print_warning "Please complete the following steps manually:"
    echo "1. Login to Vercel: vercel login"
    echo "2. Deploy: vercel --prod"
    echo "3. Follow the prompts to configure your project"
    
    read -p "Press Enter after completing Vercel deployment..."
    
    cd ../..
}

# Create demo credentials and data
setup_demo_data() {
    print_step "Demo credentials and setup information..."
    
    cat << EOF

🎯 DEMO SETUP COMPLETE!
======================

Your banking platform is now deployed for FREE! Here's what you need to know:

📧 DEMO CREDENTIALS:
Email: demo@bankingplatform.com
Password: Demo123!

🌐 DEPLOYMENT URLS:
Frontend: https://your-app.vercel.app
Backend API: https://your-app.railway.app
API Docs: https://your-app.railway.app/swagger

💳 DEMO ACCOUNTS:
Checking Account (CHK-001): $5,000.00
Savings Account (SAV-001): $15,000.00

🔧 FEATURES TO DEMONSTRATE:
✅ Secure login/logout
✅ View account balances
✅ Transfer money between accounts
✅ Transaction history
✅ Responsive design
✅ API documentation
✅ Real-time updates

💰 COST BREAKDOWN:
Frontend (Vercel): $0/month
Backend (Railway): $0/month (500 hours free)
Database (PlanetScale): $0/month (5GB free)
Redis (Upstash): $0/month (10K requests/day)
Domain: $0/month (use provided URLs)
TOTAL: $0/month! 🎉

📋 FOR RECRUITERS:
Share this link: https://your-app.vercel.app
Include in resume: "Live Banking Platform Demo"
GitHub repo: https://github.com/yourusername/banking-platform

🔗 NEXT STEPS:
1. Test all features thoroughly
2. Add the URLs to your resume/portfolio
3. Create a professional README with demo links
4. Consider adding a landing page for recruiters

EOF
}

# Create professional README
create_readme() {
    print_step "Creating professional README..."
    
    cat > DEPLOYMENT_README.md << 'EOF'
# 🏦 Banking Platform - Live Demo

## 🌟 Live Application
- **Frontend**: [Banking Platform Demo](https://your-app.vercel.app)
- **API Documentation**: [Swagger API](https://your-app.railway.app/swagger)
- **GitHub Repository**: [Source Code](https://github.com/yourusername/banking-platform)

## 🎯 Demo Credentials
```
Email: demo@bankingplatform.com
Password: Demo123!
```

## 🏗️ Architecture Overview
This is a **production-ready, cloud-native banking platform** demonstrating:

- **Microservices Architecture** with .NET Core 8
- **React TypeScript Frontend** with modern UI/UX
- **MySQL Database** with proper relationships
- **JWT Authentication** and security
- **RESTful API Design** with OpenAPI documentation
- **Cloud Deployment** on free tier services

## 💻 Technology Stack

### Backend
- .NET Core 8 (C#)
- Entity Framework Core
- MySQL Database (PlanetScale)
- JWT Authentication
- BCrypt Password Hashing
- Swagger/OpenAPI

### Frontend  
- React 18 with TypeScript
- Tailwind CSS
- Modern Hooks & Context
- Responsive Design
- Real-time Updates

### Infrastructure
- **Frontend**: Vercel (CDN + Global Edge)
- **Backend**: Railway (Container Platform)
- **Database**: PlanetScale (Serverless MySQL)
- **Monitoring**: Built-in health checks

## 🚀 Key Features

### Banking Operations
- [x] Secure user authentication
- [x] Account management
- [x] Balance inquiries
- [x] Money transfers between accounts
- [x] Transaction history
- [x] Real-time balance updates

### Technical Excellence
- [x] RESTful API design
- [x] Input validation & sanitization
- [x] SQL injection prevention
- [x] XSS protection
- [x] CORS configuration
- [x] Error handling
- [x] Audit logging
- [x] Health monitoring

### Professional UI/UX
- [x] Modern banking interface
- [x] Responsive design (mobile-first)
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Professional color scheme
- [x] Accessibility features

## 📊 Demo Scenarios

### 1. Account Overview
Login to view your accounts:
- Checking Account: $5,000.00
- Savings Account: $15,000.00

### 2. Money Transfer
Try transferring money between accounts:
1. Go to Transfer section
2. Select source and destination accounts
3. Enter amount ($1-$1000 recommended)
4. Add description
5. Submit transfer
6. View updated balances immediately

### 3. Transaction History
View complete transaction history with:
- Transaction details
- Timestamps
- Status tracking
- Amount formatting

## 🔒 Security Features

- **Authentication**: JWT tokens with secure storage
- **Password Security**: BCrypt hashing
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **HTTPS**: All communications encrypted
- **CORS**: Proper cross-origin configuration

## 📈 Scalability Considerations

- **Database**: Designed for horizontal scaling
- **API**: Stateless design for easy scaling
- **Frontend**: CDN delivery for global performance
- **Caching**: Ready for Redis integration
- **Load Balancing**: Container-ready architecture

## 🎯 For Recruiters

This project demonstrates:

### Technical Skills
- **Full-stack development** with modern technologies
- **Database design** and optimization
- **API development** with proper REST principles
- **Security implementation** for financial applications
- **Cloud deployment** and DevOps practices

### Banking Domain Knowledge
- **Financial workflows** and business logic
- **Audit requirements** and compliance thinking
- **Data consistency** and transaction integrity
- **User experience** for financial applications

### Professional Development
- **Clean code** and architecture patterns
- **Documentation** and API design
- **Testing** and quality assurance
- **Deployment** and operational considerations

## 🔗 Additional Resources

- **Portfolio**: [Your Portfolio Website]
- **LinkedIn**: [Your LinkedIn Profile]
- **Email**: [your.email@example.com]

---

*This is a demonstration application built to showcase enterprise software development skills. It uses sample data and is not connected to real financial institutions.*
EOF

    print_success "Professional README created: DEPLOYMENT_README.md"
}

# Main execution
main() {
    echo "Starting automated deployment setup..."
    
    check_prerequisites
    install_tools
    setup_backend
    setup_frontend
    
    echo ""
    echo "🚀 MANUAL STEPS REQUIRED:"
    echo "========================="
    
    deploy_backend
    deploy_frontend
    
    setup_demo_data
    create_readme
    
    print_success "Deployment setup completed!"
    print_warning "Don't forget to update the URLs in DEPLOYMENT_README.md with your actual deployment URLs!"
}

# Run main function
main