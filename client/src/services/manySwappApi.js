const axios = require('axios')

const instanceOptions = {
  baseURL: `${process.env.VUE_APP_BASE_API_URL}`
}

const manySwapApiAxios = axios.create(instanceOptions)

export const getAllTokens = async () => {
  const { data } = await manySwapApiAxios.get(`tokens`)
  return data.tokens
}
