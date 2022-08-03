import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import userExtractor from '../middlewares/userExtractor.js'
const prisma = new PrismaClient()
const router = Router()

const stripeClient = Stripe(process.env.STRIPE_SECRET_KEY)

async function sendMail (cvu, amount, destinyCvu, email) {
  const transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    // port: 587,
    // secure: false, // true for 465, false for other ports
    service: 'hotmail',
    auth: {
      user: 'wallet.pfhenry@outlook.com', // generated ethereal user
      pass: 'walletHenry' // generated ethereal password
    }
  })

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error)
    } else {
      console.log('Server is ready to take our messages')
    }
  })

  const mail = await transporter.sendMail({
    from: 'wallet.pfhenry@outlook.com', // sender address
    to: `${email}`, // list of receivers
    subject: 'New Movement', // Subject line
    // text: 'Hello world?', // plain text body
    html: `<h2>You transfer $${amount} to ${destinyCvu} from your ${cvu} account</h2>` // html body
  })
}

router.post('/create_payment_intent', userExtractor, async (req, res) => {
  let { amount, cvu } = req.body

  if (amount.includes(',')) {
    return res.json({ error: 'Incorrect format amount' }).status(406)
  }

  amount = amount.includes('.') ? amount.replace('.', '') : amount.concat('00')
  try {
    const account = await prisma.account.findUnique({
      where: {
        cvu
      },
      include: {
        users: {
          select: {
            dni: true,
            username: true,
            name: true,
            lastname: true,
            profilepic: true
          }
        }
      }
    })
    if (!account) return res.status(400).json({ msg: "The account you want to charge doesn't exist" })
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Number(amount),
      currency: 'ars',
      payment_method_types: ['card']
    })
    // console.log(paymentIntent)

    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentID: paymentIntent.id,
      account
    }).status(200)
  } catch (error) {
    console.error(error)
    res.json({ error })
  }
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
    return res.json({ error: 'Incorrect format amount.' }).status(406)
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
  const destAcc = await prisma.account.finUnique({
    where: {
      cvu: cvuD
    }
  })
  const mainAcc = await prisma.account.findUnique({
    where: {
      cvu: cvuMain
    }
  })
  const user = await prisma.user.findUnique({
    where: {
      id: mainAcc.usersIDs
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
        // categories: {
        //   connect: { name: category }
        // }
      }
    })
    const newMovementDestiny = await prisma.movement.create({
      data: {
        amount,
        receipt: true,
        sentBy: cvuMain,
        balance: destAcc.balance + amount,
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
    // await sendMail(cvuMain, amount, cvuD, user.email)
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
