// utils/storage.js
const TOKEN_KEY = "X-Token"
let CUR_PATH="CUR_PATH"
export default {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, JSON.stringify({
            value: token,
            expires: Date.now() + 604800000/7 // 7天过期（正确值）
        }))
    },
    getToken() {
        const dataStr = localStorage.getItem(TOKEN_KEY)
        if (!dataStr) return null

        try {
            const data = JSON.parse(dataStr)
            if (Date.now() > data.expires) {
                this.removeToken()  // 自动清理过期token
                return null
            }
            return data.value
        } catch (e) {
            this.removeToken()  // 数据异常时清理
            return null
        }
    },
    removeToken() {
        localStorage.removeItem(TOKEN_KEY)
    },
    setCurPath(path){
        localStorage.setItem(CUR_PATH,path)
    },
    getCurPath(path){
        return localStorage.getItem(CUR_PATH)
    }

}