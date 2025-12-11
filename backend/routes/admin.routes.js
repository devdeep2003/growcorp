import express from 'express';
import { 
    UpdateTransactionStatus, 
    GetUsers, 
    UpdateUserStatus, 
    UpdateKYCStatus,
    CreatePlan, 
    UpdatePlan, 
    TogglePlan,
    AdjustWallet,
    GetLogs,
    Broadcast
} from '../controllers/admin.controller.js';

const router = express.Router();

// Transactions
router.post('/transactions/:txId/status', UpdateTransactionStatus);

// Users
router.get('/users', GetUsers);
router.post('/users/:userId/status', UpdateUserStatus);
router.post('/users/:userId/kyc', UpdateKYCStatus);

// Plans
router.post('/plans', CreatePlan);
router.put('/plans/:planId', UpdatePlan);
router.post('/plans/:planId/toggle', TogglePlan);

// Wallet & System
router.post('/wallet/adjust', AdjustWallet);
router.get('/logs', GetLogs);
router.post('/broadcast', Broadcast);

export default router;
