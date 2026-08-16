import {prisma} from '../../config/prisma'

export async function findByEmail(email: string) {
    return await prisma.user.findUnique({
        where:{
            email: email
        },
        include:{
            role:true,
        }
    })
}
