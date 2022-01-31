import axios from "axios";
import {from} from "rxjs";
import {map, tap} from "rxjs/operators";
import Vue from 'vue'


export interface ApiResponse<T> {
    code: number,
    data: T,
    metadata: unknown
}

export abstract class ApiService {
    public static get<T>(url: string): Promise<null | T> {
        return axios.get<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`)
            .then(res => res.data.data as T)
            .catch(error => this.handleError(error))
    }

    public static delete<T>(url: string): Promise<null | T> {
        return axios.delete<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`)
            .then(res => res.data.data as T)
            .catch(error => this.handleError(error))
    }

    public static post<T>(url: string, body: T): Promise<null | T> {
        return axios.post<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`, body)
            .then(res => res.data.data as T)
            .catch(error => this.handleError(error))
    }

    public static put<T>(url: string, body: T): Promise<null | T> {
        return axios.put<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`, body)
            .then(res => res.data.data as T)
            .catch(error => this.handleError(error))
    }

    private static handleError<T>(response: any) {
        if (response && response.message) {
            Vue.$toast.error(response.message)
        }
        return null;
    }
}
