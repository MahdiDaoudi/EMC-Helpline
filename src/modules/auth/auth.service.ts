import { generateAccessToken } from "../../utils/jwt";
import * as authRepository from "./auth.repository";
import bcrypt from 'bcrypt'

export async function login(email:string, password:string) {
  const user = await authRepository.findByEmail(email);
  if(!user){
    throw new Error("Invalid email or password");
  }

  const isValidePassword = await bcrypt.compare(
    password,
    user.hashedPassword
  )

  if(!isValidePassword){
    throw new Error("Invalid email or password");
  }

  const token = generateAccessToken(user.id,user.role.name)
  return {
    accessToken:token,
    user:{
        firstName:user.firstName,
        lastName:user.lastName,
        role:user.role.name
    }
  }
}