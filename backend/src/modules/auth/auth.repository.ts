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


export async function updatePassword(email: string, newHashedPassword: string) {
    return await prisma.user.update({
        where:{
            email:email,
        },
        data:{
            hashedPassword:newHashedPassword
        }
    })
}