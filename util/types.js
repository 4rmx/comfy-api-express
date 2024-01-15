/**
 * @typedef {'status'|'progress'|'executing'|'executed'|'execution_start'|'execution_error'|'execution_cached'} MessageType
 *
 * @typedef MsgStatus
 * @property {'status'} type
 * @property {object} data
 * @property {object} data.status
 * @property {object} data.status.exec_info
 * @property {number} data.status.exec_info.queue_remaining
 * 
 * @typedef MsgExeStart
 * @property {string} type
 * @property {object} data
 * @property {string} data.prompt_id
 * 
 * @typedef MsgExeCached
 * @property {string} type
 * @property {object} data
 * @property {} data.nodes
 * @property {string} data.prompt_id
 * 
 * @typedef MsgExe
 * @property {string} type
 * @property {object} data
 * @property {string|null} data.node
 * @property {string} data.prompt_id
 * 
 * @typedef MsgProgress
 * @property {string} type
 * @property {object} data
 * @property {number} data.value
 * @property {number} data.max
 * 
 * @typedef MsgExecuted
 * @property {string} type
 * @property {object} data
 * @property {string} data.node
 * @property {object} data.output
 * @property {object[]} data.output.images
 * @property {string} data.output.images.filename
 * @property {string} data.output.images.subfolder
 * @property {string} data.output.images.type
 * @property {string} data.prompt_id
 */

module.exports = {};
