import express from 'express';  
import dashboardController from '../controllers/dashboardController';
import authMiddleware from '../middlewares/authMiddleware';
import asyncHandler from '../lib/asyncHandler';
import multer from 'multer';
const upload = multer();

const router = express.Router(); 
 
router.get('/', authMiddleware, asyncHandler(dashboardController.getDashboard));

export default router;
