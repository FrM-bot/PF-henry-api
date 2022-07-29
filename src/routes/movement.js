import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import userExtractor from '../middlewares/userExtractor.js'
const prisma = new PrismaClient()
const router = Router()

const stripeClient = Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/create_payment_intent', userExtractor, async (req, res) => {
  let { amount } = req.body

  if (amount.includes(',')) {
    return res.json({ error: 'Incorrect format amount' }).status(400)
  }

  amount = amount.includes('.') ? amount.replace('.', '') : amount.concat('00')

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Number(amount),
    currency: 'ars',
    payment_method_types: ['card']
  })
  // console.log(paymentIntent)

  res.send({
    clientSecret: paymentIntent.client_secret,
    paymentIntentID: paymentIntent.id
  }).status(200)
})

router.post('/cancel_payment_intent', userExtractor, async (req, res) => {
  const { paymentIntentID } = req.body
  const paymentIntent = await stripeClient.paymentIntents.cancel(
    paymentIntentID
  )

  res.send({
    message: `Payment status: ${paymentIntent.status}`
  }).status(200)
})

router.post('/charge', userExtractor, async (req, res) => {
  const { cvu, chargeMethod, amount: amountString } = req.body
  if (amountString.includes(',')) {
    return res.json({ error: 'Incorrect format amount.' }).status(400)
  }

  const amount = Number(amountString)

  if (!cvu || !chargeMethod || !amount) return res.status(404).json({ msg: 'Necessary information never sent' })
  try {
    const acc = await prisma.account.findUnique({
      where: {
        cvu
      }
    })
    if (!acc) return res.status(400).json({ msg: "The account you want to charge doesn't exist" })
    const newCharge = await prisma.movement.create({
      data: {
        amount,
        chargeMethod,
        balance: acc.balance + amount,
        accounts: {
          connect: {
            cvu
          }
        },
        currencies: {
          connectOrCreate: {
            where: {
              name: 'Pesos'
            },
            create: {
              name: 'Pesos'
            }
          }
        },
        operations: {
          connectOrCreate: {
            where: {
              name: 'Charge'
            },
            create: {
              name: 'Charge'
            }
          }
        },
        categories: {
          connectOrCreate: {
            where: {
              name: 'Charge'
            },
            create: {
              name: 'Charge'
            }
          }
        }
      }
    })
    if (newCharge) {
      const updateAcc = await prisma.account.update({
        where: {
          cvu
        },
        data: {
          balance: {
            increment: amount
          }
        }
      })
      if (updateAcc) {
        const updateMov = await prisma.movement.update({
          where: {
            id: newCharge.id
          },
          data: {
            receipt: true
          }
        })
        if (updateMov) return res.status(200).json({ msg: 'The charge was successfull', newCharge, updateAcc, updateMov })
      }
    }
    return res.status(400).json({ msg: "Can't make the movement" })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "Can't make this charge" })
  }
})

router.post('/make_a_movement', userExtractor, async (req, res) => {
  const { cvuMain, amount, cvuD, currency, operation, category, comment } = req.body
  const mainAcc = await prisma.account.findUnique({
    where: {
      cvu: cvuMain
    }
  })
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
        balance: mainAcc.balance - amount,
        destiny: cvuD,
        comment,
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
            operations: true,
            balance: true
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
