const express = require('express');
const cors = require('cors');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const { WebSocket } = require('ws');
const fs = require('fs');
const cliProgress = require('cli-progress');

const wf = require('./wf.json');
const { COMFYUI_API_ENDPOINT, comfyAPI } = require('./config');

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

app.use('/static', express.static('public'));

app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'page', 'index.html'));
});

app.post('/gen', (req, res) => {
  const { pos, neg } = req.body;

  // Create ClientId
  const client_id = uuidv4();

  // Create Websocket
  const ws = new WebSocket(`ws://${COMFYUI_API_ENDPOINT}/ws?clientId=${client_id}`);

  // Create simple progress bar
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  // log when error
  ws.on('error', console.error);

  // handle incomming message from websocket
  ws.on('message', handleComfyUIMessage);

  /** @param {string} msg */
  function handleComfyUIMessage(msg) {
    msg = JSON.parse(msg);
    /** @type {import('./util/types').MessageType} */
    const type = msg?.type;
    if (type === 'status') {
      /** @type {import('./util/types').MsgStatus} */
      const { data } = msg;
      // console.log(data.status.exec_info);
      const { queue_remaining } = data.status.exec_info;
      console.log({ queue_remaining });
    } else if (type === 'execution_start') {
      /** @type {import('./util/types').MsgExeStart} */
      const { data } = msg;
      console.log('prompt_id:', data.prompt_id);
    } else if (type === 'executing') {
      /** @type {import('./util/types').MsgExe} */
      const { data } = msg;
      // when all execution is done and queue is available
      if (data.node === null) {
        console.log('DONE!');
      } else {
        console.log(data);
      }
    } else if (type === 'executed') {
      // when execution is done
      /** @type {import('./util/types').MsgExecuted} */
      const { data } = msg;
      console.log(data.output.images);
      handleDownloadImage(data.output.images[0]);
    } else if (type === 'progress') {
      // when sampler progress use progress bar to show status
      /** @type {import('./util/types').MsgProgress} */
      const { data } = msg;
      if (bar1.getProgress() === 0) {
        bar1.start(data.max, data.value);
      } else if (data.max === data.value) {
        bar1.update(data.value);
        bar1.stop();
      } else {
        bar1.update(data.value);
      }
    } else {
      console.log(msg);
    }
  }

  /**
   * @typedef  Image
   * @property {string} filename
   * @property {string} subfolder
   * @property {string} type
   *
   * @param {Image} image
   */
  async function handleDownloadImage(image) {
    try {
      const params = new URLSearchParams(image);
      const response = await comfyAPI.get(`view?${params}`, { responseType: 'arraybuffer' });
      console.log('Downloaded!');
      ws.close();
      fs.writeFileSync(`${image.filename}`, response.data);
      res.send(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // when socket connected
  ws.on('open', () => {
    console.log('socket is connected!');
    // manual random seed by js code;
    wf[6].inputs.seed = randomSeed();
    wf[3].inputs.text = pos || '1girl, pink sweater, white background';
    wf[4].inputs.text = neg || '(worst quality:2), (low quality:2), (normal quality:2), lowres, watermark';
    queuePrompt(wf, client_id);
  });
});

async function queuePrompt(prompt, client_id) {
  try {
    const res = await comfyAPI.post('prompt', { prompt, client_id });
    console.log(res.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err.response.status);
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    throw err;
  }
}

function randomSeed() {
  function countDecimals(value) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1].length || 0;
  }
  function addZero(count) {
    let txt = '1';
    for (let i = 0; i < count; i++) {
      txt += '0';
    }
    return Number(txt);
  }
  const rand = Math.random();
  const count = countDecimals(rand);
  return Math.floor(rand * addZero(count));
}

module.exports = app;
