import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.get('/', async (req, res) => {
  try {
    const data = await prisma.category.findMany({
      select: {
        name: true
      }
    })
    res.json(data)
  } catch (error) {
    console.log(error)
  }
})

router.post('/', async (req, res) => {
  const data = await prisma.category.createMany({
    data: [
      { name: 'transport' },
      { name: 'shopping' },
      { name: 'subscriptions' },
      { name: 'groceries' }
    ]
  })
  res.json(data)
})

export default router
