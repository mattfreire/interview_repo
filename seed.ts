/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const NUM_USERS = 100;
const NUM_PRODUCTS = 1000;
const NUM_INVOICES = 5000;
const MAX_INVOICE_ITEMS = 10;

async function main() {
  console.log('Seeding database...');

  // Create users and customers
  const users = await Promise.all(
    Array.from({ length: NUM_USERS }).map(async () => {
      const name = faker.person.firstName()
      const user = await prisma.user.create({
        data: {
          name,
          email: faker.internet.email(),
          Customer: {
            create: {
              address: faker.location.streetAddress(),
            },
          },
        },
        include: { Customer: true },
      });
      return user;
    })
  );

  console.log(`Created ${users.length} users and customers`);

  // Create products
  const products = await Promise.all(
    Array.from({ length: NUM_PRODUCTS }).map(async (_, index) => {
      return prisma.product.create({
        data: {
          id: index + 1,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        },
      });
    })
  );

  console.log(`Created ${products.length} products`);

  // Create invoices and invoice items
  for (let i = 0; i < NUM_INVOICES; i++) {
    const customer = faker.helpers.arrayElement(users).Customer[0]!;
    const numItems = faker.number.int({ min: 1, max: MAX_INVOICE_ITEMS });
    const invoiceItems = Array.from({ length: numItems }).map(() => {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      return {
        product_id: product.id,
        quantity,
        unit_price: product.price,
      };
    });
    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum + Number(item.unit_price) * item.quantity,
      0
    );

    await prisma.invoice.create({
      data: {
        id: i + 1,
        customer_id: customer.id,
        total_amount: totalAmount,
        status: faker.helpers.arrayElement([
          "PENDING",
          "COMPLETE",
        ]),
        InvoiceItem: {
          create: invoiceItems.map((item, index) => ({
            id: i * MAX_INVOICE_ITEMS + index + 1,
            ...item,
          })),
        },
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`Created ${i + 1} invoices`);
    }
  }

  console.log(`Finished creating ${NUM_INVOICES} invoices`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => console.error())
  });