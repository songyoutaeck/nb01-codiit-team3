import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';
import { GradeName, CategoryName, PaymentStatus } from '@prisma/client'; 

const seedDashboardTestData = async () => {
  const createdDates = [
    new Date('2025-06-30'), // 오늘
    new Date('2025-06-29'),
    new Date('2025-06-28'),
    new Date('2025-06-27'),
    new Date('2025-06-23'),
    new Date('2025-06-22'),
    new Date('2025-06-16'),
    new Date('2025-06-09'),
    new Date('2025-05-31'),
    new Date('2024-06-30'),
  ];

  for (let i = 0; i < createdDates.length; i++) {
    const createdAt = createdDates[i];
    const orderId = `order_${i}`;
    const orderItemId = `orderItem_${i}`;
    const paymentId = `payment_${i}`;

    await prismaClient.order.create({
      data: {
        id: orderId,
        userId: 'userId',
        name: '홍길동',
        phoneNumber: '010-1234-1234',
        address: '서울시 강남구',
        subtotal: 50000,
        totalQuantity: 2,
        usePoint: 0,
        createdAt,
      },
    });

    await prismaClient.orderItem.create({
      data: {
        id: orderItemId,
        orderId,
        productId: 'productId',
        sizeId: 'sizeId',
        quantity: 2,
        price: 25000,
      },
    });

    await prismaClient.payment.create({
      data: {
        id: paymentId,
        orderId,
        price: 50000,
        status: PaymentStatus.CompletedPayment,
        createdAt,
      },
    });
  }
};

describe('대시보드 API 테스트 - createdAt 기반 자동 집계', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);

    await prismaClient.grade.create({
      data: {
        id: 'grade_green',
        name: GradeName.Green,
        rate: 5,
        minAmount: 100000,
      },
    });

    await prismaClient.user.create({
      data: {
        id: 'userId',
        name: '테스트유저',
        email: 'test@test.com',
        password: 'hashedPassword',
        gradeId: 'grade_green',
        points: 0,
      },
    });

    await prismaClient.store.create({
      data: {
        id: 'storeId',
        name: '테스트스토어',
        userId: 'userId',
        address: '서울',
        phoneNumber: '010-1234-5678',
        content: '내용',
        image: '이미지URL',
      },
    });

    await prismaClient.category.create({
      data: {
        id: 'categoryId',
        name: CategoryName.BOTTOM,
      },
    });

    await prismaClient.product.create({
      data: {
        id: 'productId',
        name: '청바지',
        storeId: 'storeId',
        categoryId: 'categoryId',
        price: 25000,
        image: '이미지URL',
        discountRate: 10,
        discountStartTime: new Date('2025-06-17T01:49:11.128Z'),
        discountEndTime: new Date('2025-06-27T01:49:11.128Z'),
      },
    });

    await prismaClient.size.create({
      data: {
        id: 'sizeId',
        name: 'L',
        size: { en: 'L', ko: '라지' },
      },
    });

    await prismaClient.stock.create({
      data: {
        id: 'stockId',
        productId: 'productId',
        sizeId: 'sizeId',
        quantity: 100,
      },
    });

    await seedDashboardTestData();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });
  test('GET /api/dashboard - 전체 대시보드 데이터를 정확히 반환한다', async () => {
    const response = await request(app).get('/api/dashboard');

    expect(response.status).toBe(200);

    const body = response.body;

    const expectPeriod = (period: string, current: number, previous: number, rate: number) => {
      expect(body[period].current.totalOrders).toBe(current);
      expect(body[period].current.totalSales).toBe(current * 30000);
      expect(body[period].previous.totalOrders).toBe(previous);
      expect(body[period].previous.totalSales).toBe(previous * 30000);
      expect(body[period].changeRate.totalOrders).toBe(rate);
      expect(body[period].changeRate.totalSales).toBe(rate);
    };

    expectPeriod('today', 30, 20, 50);
    expectPeriod('week', 50, 40, 25);
    expectPeriod('month', 90, 60, 50);
    expectPeriod('year', 120, 100, 20);

    expect(Array.isArray(body.topSales)).toBe(true);
    expect(Array.isArray(body.priceRange)).toBe(true);
  });
}); 
