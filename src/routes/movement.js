import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.post('/make_a_movement', async (req, res) => {
  const { cvuMain, amount, cvuD, currency, operation, category } = req.body
  try {
    const updateMainAcc = await prisma.account.update({
      where: {
        cvu: cvuMain
      },
      data: {
        balance: {
          decrement: amount
        }
      }
    })
    const updateDestinyAcc = await prisma.account.update({
      where: {
        cvu: cvuD
      },
      data: {
        balance: {
          increment: amount
        }
      }
    })
    const newMovement = await prisma.movement.create({
      data: {
        amount,
        receipt: true,
        destiny: cvuD,
        accounts: {
          connect: { cvu: cvuMain }
        },
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
        operations: {
          connectOrCreate: {
            where: {
              name: operation
            },
            create: {
              name: operation
            }
          }
        },
        categories: {
          connectOrCreate: {
            where: {
              name: category
            },
            create: {
              name: category
            }
          }
        }
      }
    })
    res.status(200).json({ newMovement, updateMainAcc, updateDestinyAcc })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't make the movement, try again later" })
  }
})

export default router
