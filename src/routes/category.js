import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.get('/', async (req, res) => {
  //   const { email, password, name, lastname, dni } = req.body
  try {
    const data = await prisma.category.findMany({})
    const result = data.map(d => d.name)
    res.json(result)
  } catch (error) {
    console.log(error)
  }
})

router.post('/', async (req, res) => {
  const category = req.body
  const data = await prisma.category.create({
    data: {
      name: category.name
    }
  })
  res.json(data)
})

export default router
