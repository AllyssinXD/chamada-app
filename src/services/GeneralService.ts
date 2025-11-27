import type { Dictionary } from "@/ConfirmPresence"
import type ChamadaModel from "@/models/ChamadaModel"
import axios, { AxiosError } from "axios"

const getAllChamadas = async ()=>{
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/chamada")
        if (!response.data) throw new Error("Não foi possivel pegar as chamadas.")
        const data : ChamadaModel[] = response.data.chamadas
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

const getChamada = async (id: string)=>{
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/chamada/"+id)
        if (!response.data) throw new Error("Não foi possivel pegar a chamada.")
        const data : ChamadaModel = response.data.chamada
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

export interface CustomInputs {
    _id: string,
    id_chamada: string,
    label: string, 
    type: string,
    placeholder: string
}

export interface Presence {
    _id: string,
    id_chamada: string, 
    nome: string,
    envio: string,
    ip: string,
    long: Number,
    lag: Number
}

export interface PopulatedPresences extends Presence {
    customValues: Dictionary<string>
}


export interface GetPresencesResponse extends Presence {
    customInputs: CustomInputs[],
    populatedPresences: PopulatedPresences[]
}

const getAllPresencesFromChamada = async (id: string)=>{
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/presence/"+id)
        if (!response.data) throw new Error("Não foi possivel pegar a chamada.")
        const data : GetPresencesResponse = response.data
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

const createChamada = async (lag: number, long:number)=>{
    try {
        const response = await axios.post(import.meta.env.VITE_API_URL + "/chamada/",{
            nome: "Nova Chamada",
            lag,
            long,
            ativa: true,
            dataInicio: new Date(Date.now()).toJSON(),
            dataFim: new Date(Date.now()+100000).toJSON(),
            toleranceMeters: 500,
            customInputs: []
        })
        if (!response.data) throw new Error("Não foi possivel CRIAR a chamada.")
        if (response.data.err) throw new Error("Não foi possivel CRIAR a chamada.")
        const data : ChamadaModel = response.data.chamada
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

const addCustomInput = async (id: string)=>{
    try {
        const response = await axios.post(import.meta.env.VITE_API_URL + "/chamada/"+id+"/input")
        if (!response.data) throw new Error("Não foi possivel pegar a chamada.")
        const data : CustomInputs = response.data.newInput
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

const deleteCustomInput = async (id: string)=>{
    try {
        const response = await axios.delete(import.meta.env.VITE_API_URL + "/chamada/"+id+"/input")
        if (!response.data) throw new Error("Não foi possivel pegar a chamada.")
        const data : CustomInputs[] = response.data.customInputs
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

const updateChamada = async (chamada: ChamadaModel, customInputs: CustomInputs[])=>{
    try {
        const response = await axios.put(import.meta.env.VITE_API_URL + "/chamada/"+chamada._id, {
            chamada,
            customInputs
        })
        if (!response.data) throw new Error("Não foi possivel pegar a chamada.")
        const data : ChamadaModel = response.data
        return data;
    } catch (err: any) {
        if (err instanceof AxiosError)
            if(err.response) return err.response.data.message;
            else return err.message;
        else return err;
    }
}

export {createChamada, getAllChamadas, updateChamada, deleteCustomInput, getChamada, getAllPresencesFromChamada, addCustomInput};