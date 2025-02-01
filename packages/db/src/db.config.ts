import {PrismaClient} from '@prisma/client'
// use signleton practivce here 

const prisma:PrismaClient = new PrismaClient()

export default prisma