import React, { useState, createContext, useContext } from 'react';
import './App.css';

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// Mock data for demo
const mockAccounts = [
  {
    id: '1',
    accountNumber: 'CHK-001',
    type: 'Checking',
    balance: 5000.00,
    currency: 'USD'
  },
  {
    id: '2', 
    accountNumber: 'SAV-001',
    type: 'Savings',
    balance: 15000.00,
    currency: 'USD'
  }
];

const mockTransactions = [
  {
    id: '1',
    fromAccount: 'CHK-001',
    toAccount: 'SAV-001',
    amount: 500.00,
    description: 'Transfer to Savings',
    date: '2024-12-18',
    status: 'Completed'
  },
  {
    id: '2',
    fromAccount: 'SAV-001', 
    toAccount: 'CHK-001',
    amount: 200.00,
    description: 'Transfer to Checking',
    date: '2024-12-17',
    status: 'Completed'
  }
];

// Login Component
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@bankingplatform.com');
  const [password, setPassword] = useState('Demo123!');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'demo@bankingplatform.com' && password === 'Demo123!') {
      onLogin({ email, name: 'Demo User' });
    } else {
      alert('Invalid credentials. Use demo@bankingplatform.com / Demo123!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="bank-logo">
          <h1>🏦 Banking Platform</h1>
          <p>Secure Enterprise Banking</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <button type="submit" className="login-btn">
            Sign In Securely
          </button>
        </form>
        
        <div className="demo-info">
          <h4>🔑 Demo Credentials</h4>
          <p><strong>Email:</strong> demo@bankingplatform.com</p>
          <p><strong>Password:</strong> Demo123!</p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, accounts }) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Welcome back, {user.name}!</h2>
        <p>Here's your account overview</p>
      </div>
      
      <div className="balance-cards">
        <div className="balance-card total">
          <h3>Total Balance</h3>
          <div className="amount">${totalBalance.toLocaleString()}</div>
          <p>Across all accounts</p>
        </div>
        
        {accounts.map(account => (
          <div key={account.id} className="balance-card">
            <h4>{account.type}</h4>
            <div className="account-number">{account.accountNumber}</div>
            <div className="amount">${account.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>
      
      <div className="quick-actions">
        <button className="action-btn">💸 Transfer Money</button>
        <button className="action-btn">📊 View Statements</button>
        <button className="action-btn">💳 Pay Bills</button>
        <button className="action-btn">👤 Manage Profile</button>
      </div>
    </div>
  );
};

// Accounts Component
const AccountsPage = ({ accounts }) => {
  return (
    <div className="accounts-page">
      <h2>My Accounts</h2>
      <div className="accounts-grid">
        {accounts.map(account => (
          <div key={account.id} className="account-card">
            <div className="account-header">
              <h3>{account.type} Account</h3>
              <span className="account-number">{account.accountNumber}</span>
            </div>
            <div className="account-balance">
              <span className="currency">{account.currency}</span>
              <span className="amount">${account.balance.toLocaleString()}</span>
            </div>
            <div className="account-actions">
              <button className="btn-secondary">View Details</button>
              <button className="btn-primary">Transfer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transfer Component
const TransferPage = ({ accounts }) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount) {
      alert('Please fill all fields');
      return;
    }
    if (fromAccount === toAccount) {
      alert('Cannot transfer to the same account');
      return;
    }
    alert(`Transfer of $${amount} from ${fromAccount} to ${toAccount} completed successfully!`);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="transfer-page">
      <h2>Transfer Money</h2>
      <div className="transfer-form-container">
        <form onSubmit={handleTransfer} className="transfer-form">
          <div className="form-group">
            <label>From Account</label>
            <select 
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.accountNumber}>
                  {account.type} - {account.accountNumber} (${account.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>To Account</label>
            <select 
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.accountNumber}>
                  {account.type} - {account.accountNumber}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              placeholder="Transfer description"
            />
          </div>
          
          <button type="submit" className="transfer-btn">
            Transfer Money
          </button>
        </form>
      </div>
    </div>
  );
};

// Transactions Component
const TransactionsPage = ({ transactions }) => {
  return (
    <div className="transactions-page">
      <h2>Transaction History</h2>
      <div className="transactions-list">
        {transactions.map(txn => (
          <div key={txn.id} className="transaction-item">
            <div className="transaction-info">
              <div className="transaction-accounts">
                <span>{txn.fromAccount}</span>
                <span className="arrow">→</span>
                <span>{txn.toAccount}</span>
              </div>
              <div className="transaction-description">{txn.description}</div>
            </div>
            <div className="transaction-details">
              <div className="transaction-amount">${txn.amount.toLocaleString()}</div>
              <div className="transaction-date">{txn.date}</div>
              <div className={`transaction-status ${txn.status.toLowerCase()}`}>
                {txn.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: '🏠 Dashboard' },
    { id: 'accounts', label: '💰 Accounts' },
    { id: 'transfer', label: '💸 Transfer' },
    { id: 'transactions', label: '📊 Transactions' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h3>🏦 Banking Platform</h3>
      </div>
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="nav-footer">
        <button onClick={onLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, handleLogin }}>
        <div className="App">
          <LoginPage onLogin={handleLogin} />
        </div>
      </AuthContext.Provider>
    );
  }

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard user={user} accounts={mockAccounts} />;
      case 'accounts':
        return <AccountsPage accounts={mockAccounts} />;
      case 'transfer':
        return <TransferPage accounts={mockAccounts} />;
      case 'transactions':
        return <TransactionsPage transactions={mockTransactions} />;
      default:
        return <Dashboard user={user} accounts={mockAccounts} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="App banking-app">
        <Navigation 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />
        <main className="main-content">
          {renderCurrentPage()}
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;