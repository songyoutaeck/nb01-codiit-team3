import { GradeName, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 테스트 환경에서는 seed 실행하지 않음
  if (process.env.NODE_ENV === 'test') {
    console.log('❌ 테스트 환경에서는 seed를 실행하지 않습니다.');
    return;
  }

  await prisma.grade.upsert({
    where: { id: 'grade_green' },
    update: {},
    create: {
      id: 'grade_green',
      name: GradeName.Green,
      rate: 0,
      minAmount: 0,
    },
  });

  console.log('✅ Grade seed complete');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
