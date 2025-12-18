// Updated API client for free hosting deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface LoginResponse {
  token: string;
  customerId: string;
  email: string;
}

interface Account {
  accountId: string;
  customerId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Transaction {
  transactionId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Unauthorized');
      }
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await this.handleResponse<LoginResponse>(response);
    
    // Store token
    this.token = result.token;
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('customerId', result.customerId);
    localStorage.setItem('userEmail', result.email);
    
    return result;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('userEmail');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/api/accounts`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Account[]>(response);
  }

  async getAccountBalance(accountId: string): Promise<{ balance: number; currency: string }> {
    const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/balance`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ balance: number; currency: string }>(response);
  }

  async transferMoney(transfer: TransferRequest): Promise<{ transactionId: string; status: string }> {
    const response = await fetch(`${API_BASE_URL}/api/transactions/transfer`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transfer)
    });

    return this.handleResponse<{ transactionId: string; status: string }>(response);
  }

  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Transaction[]>(response);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse<{ status: string; timestamp: string }>(response);
  }
}

export const apiClient = new ApiClient();
export type { Account, Transaction, TransferRequest, LoginResponse };