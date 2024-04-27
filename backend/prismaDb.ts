import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createUser(name: string, email: string) {
  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  })
  await prisma.$disconnect()
  console.log(user)
  return user
}

export async function readUsers() {
  const users = await prisma.user.findMany()
  console.log(users)
  await prisma.$disconnect()
  return users
}