import type { CustomInputs } from "@/services/GeneralService"

export default interface ChamadaModel {
    _id: string,
    nome: string,
    dataInicio: string,
    dataFim: string,
    lag: number,
    long: number,
    toleranceMeters: number,
    ativa: boolean
    customInputs: CustomInputs[]
}