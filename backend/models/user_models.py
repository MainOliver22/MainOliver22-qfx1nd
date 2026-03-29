# User Model

class User:
    def __init__(self, user_id, username, email, created_at):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.created_at = created_at

# Wallet Model

class Wallet:
    def __init__(self, wallet_id, user_id, balance, created_at):
        self.wallet_id = wallet_id
        self.user_id = user_id
        self.balance = balance
        self.created_at = created_at

# Order Model

class Order:
    def __init__(self, order_id, user_id, total_amount, created_at):
        self.order_id = order_id
        self.user_id = user_id
        self.total_amount = total_amount
        self.created_at = created_at

# Transaction Model

class Transaction:
    def __init__(self, transaction_id, wallet_id, amount, transaction_type, created_at):
        self.transaction_id = transaction_id
        self.wallet_id = wallet_id
        self.amount = amount
        self.transaction_type = transaction_type  # e.g., 'credit' or 'debit'
        self.created_at = created_at
