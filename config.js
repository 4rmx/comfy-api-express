const { default: baseAxios } = require('axios');

const COMFYUI_API_ENDPOINT = '192.168.0.1:8188';

const comfyAPI = baseAxios.create({ baseURL: 'http://' + COMFYUI_API_ENDPOINT });

module.exports = { COMFYUI_API_ENDPOINT, comfyAPI };
