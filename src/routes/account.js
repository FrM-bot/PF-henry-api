import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.post('/', async (req, res) => {
  const { cvu, email, currency } = req.body
  try {
    const newAccount = await prisma.account.create({
      data: {
        cvu,
        currencies: {
          connectOrCreate: {
            where: {
              name: currency
            },
            create: {
              name: currency
            }
          }
        },
        users: {
          connect: { email }
        }
      }
    })
    res.status(200).json(newAccount)
  } catch (error) {
    res.status(400).json({ msg: "Can't create the account." })
  }
})

export default router
