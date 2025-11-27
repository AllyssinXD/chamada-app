import type { AdminProfile } from "@/models/UserModel"
import axios from "axios"

export interface AuthResponse {
    token: string
}

export const loginAPI = async (username: string, password: string) => {
    try {
        const response = await axios.post(import.meta.env.VITE_API_URL + "/auth/login", {
                username,
                password
            }, {
            headers: {
                "Content-Type": "application/json"
            },
        })

        const data: AuthResponse = response.data
        return data;
    } catch (err) {
        console.error(err)
        throw err
    }
}

export const getAdmin = async () => {
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/auth/", {
            headers: {
                "Content-Type": "application/json",
            }
        })

        const data: AdminProfile = await response.data.user
        return data;
    } catch (err) {
        console.error(err)
    }
}
