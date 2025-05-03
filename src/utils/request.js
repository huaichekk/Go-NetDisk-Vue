import axios from 'axios'
import storage  from "@/utils/storage.js"
import router from "@/router/index.js";
// 创建axios实例
const service = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
})

let loadingInstance = null

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token=storage.getToken()
        if(token){
            config.headers['X-Token']=token
        }
        return config
    },
    (error) => {
        // 请求错误处理
        loadingInstance?.close()
        return Promise.reject(error)
    }
)
service.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            router.replace('/login')
        }
        return Promise.reject(error);
    }
)


// 封装常用方法
export const get = (url, params = {}, config = {}) => {
    return service.get(url, { params, ...config })
}

export const post = (url, data = {}, config = {}) => {
    return service.post(url, data, config)
}

export const put = (url, data = {}, config = {}) => {
    return service.put(url, data, config)
}

export const del = (url, params = {}, config = {}) => {
    return service.delete(url, { params, ...config })
}

export default service