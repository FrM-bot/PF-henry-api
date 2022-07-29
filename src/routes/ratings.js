import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.post('/', async (req, res) => {
  const { rate, comment } = req.body
  try {
    const newRating = await prisma.rating.create({
      data: {
        rate,
        comment
      }
    })
    console.log(newRating)
    res.status(200).json(newRating)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't create the rate." })
  }
})

router.get('/', async (req, res) => {
  try {
    const rate = await prisma.rating.findMany({
      select: {
        rate: true,
        comment: true
      }
    })
    res.status(200).json(rate)
  } catch (error) {
    console.log(error)
  }
})

export default router
