import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.post('/make_a_movement', async (req, res) => {
  const { cvuMain, amount, cvuD, currency, operation, category } = req.body
  const mainAcc = await prisma.account.findUnique({
    where: {
      cvu: cvuMain
    }
  })
  console.log(mainAcc)
  if (mainAcc.balance < amount) return res.status(400).json({ msg: 'Your balance is less than necessary' })
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
    const newMovementDestiny = await prisma.movement.create({
      data: {
        amount,
        receipt: true,
        sentBy: cvuMain,
        accounts: {
          connect: { cvu: cvuD }
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
              name: operation === 'Debit' ? 'Credit' : 'Debit'
            },
            create: {
              name: operation === 'Debit' ? 'Credit' : 'Debit'
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
    res.status(200).json({ newMovement, newMovementDestiny, updateMainAcc, updateDestinyAcc })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't make the movement, try again later" })
  }
})

router.post('/', async (req, res) => {
  const { cvu } = req.body
  try {
    const accountMovs = await prisma.account.findUnique({
      where: {
        cvu
      },
      include: {
        movements: {
          orderBy: {
            date: 'desc'
          },
          select: {
            date: true,
            amount: true,
            destiny: true,
            sentBy: true,
            currencies: true,
            categories: true,
            operations: true
          }
        }
      }
    })
    res.status(200).json(accountMovs)
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'Cannot find movements for this account' })
  }
})
export default router
