import { Request, Response } from 'express';

export const getDashboard = async (req: Request, res: Response) => {
  try { 
    return res.status(200).json({
      today: { current: {}, previous: {}, changeRate: {} },
      week: { current: {}, previous: {}, changeRate: {} },
      month: { current: {}, previous: {}, changeRate: {} },
      year: { current: {}, previous: {}, changeRate: {} },
      topSales: [],
      priceRange: [],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default { getDashboard };