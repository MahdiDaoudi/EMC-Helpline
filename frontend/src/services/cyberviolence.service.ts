import { api } from "./api"


interface CyberViolence {
    id: number,
    name: string
}
export const CyberViolenceService = {
    async getCyberViolence(): Promise<CyberViolence[]>{
        const {data} = await api.get<CyberViolence[]>("/cyberviolences");
        return data;
    }
}