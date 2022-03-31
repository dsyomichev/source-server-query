/* eslint-disable no-bitwise */
const client = require('dgram').createSocket('udp4');

const send = (request, remote, timeout) => {
  return new Promise((resolve, reject) => {
    let onResponse;
    const onTimeout = setTimeout(() => {
      client.removeListener('message', onResponse);
      reject(new Error(`Request Timeout`));
    }, timeout);

    onResponse = (response, rinfo) => {
      if (rinfo.address !== remote.address || remote.port !== rinfo.port) return;

      client.removeListener('message', onResponse);
      clearTimeout(onTimeout);
      resolve(response);
    };

    client.on('message', onResponse);
    client.send(request, remote.port, remote.address);
  });
};

const pack = (header, payload, challenge) => {
  const preamble = Buffer.alloc(4);
  preamble.writeInt32LE(-1, 0);

  const request = Buffer.from(header);
  const data = payload ? Buffer.concat([Buffer.from(payload), Buffer.alloc(1)]) : Buffer.alloc(0);
  let prologue = Buffer.alloc(0);
  if (challenge) {
    prologue = Buffer.alloc(4);
    prologue.writeInt32LE(challenge);
  }

  return Buffer.concat([preamble, request, data, prologue, preamble]);
};

const challenge = async (remote, header, payload, timeout) => {
  const request = pack(header, payload);

  const response = await send(request, remote, timeout);
  const type = response.slice(4, 5).toString();

  if (type === 'A') {
    const challenger = response.readInt32LE(5);
    const final = pack(header, payload, challenger);

    return send(final, remote, timeout);
  }

  return response;
};

module.exports.info = async (address, port, timeout = 1000) => {
  const query = await challenge({ address, port: parseInt(port, 10) }, 'T', 'Source Engine Query', timeout);

  const result = {};
  let offset = 4;

  result.header = query.slice(offset, offset + 1);
  offset += 1;
  result.header = result.header.toString();

  result.protocol = query.readInt8(offset);
  offset += 1;

  result.name = query.slice(offset, query.indexOf(0, offset));
  offset += result.name.length + 1;
  result.name = result.name.toString();

  result.map = query.slice(offset, query.indexOf(0, offset));
  offset += result.map.length + 1;
  result.map = result.map.toString();

  result.folder = query.slice(offset, query.indexOf(0, offset));
  offset += result.folder.length + 1;
  result.folder = result.folder.toString();

  result.game = query.slice(offset, query.indexOf(0, offset));
  offset += result.game.length + 1;
  result.game = result.game.toString();

  result.id = query.readInt16LE(offset);
  offset += 2;

  result.players = query.readInt8(offset);
  offset += 1;

  result.max_players = query.readInt8(offset);
  offset += 1;

  result.bots = query.readInt8(offset);
  offset += 1;

  result.server_type = query.slice(offset, offset + 1).toString();
  offset += 1;

  result.environment = query.slice(offset, offset + 1).toString();
  offset += 1;

  result.visibility = query.readInt8(offset);
  offset += 1;

  result.vac = query.readInt8(offset);
  offset += 1;

  result.version = query.slice(offset, query.indexOf(0, offset));
  offset += result.version.length + 1;
  result.version = result.version.toString();

  const extra = query.slice(offset);

  offset = 0;
  if (extra.length < 1) return result;

  const edf = extra.readInt8(offset);
  offset += 1;

  if (edf & 0x80) {
    result.port = extra.readInt16LE(offset);
    offset += 2;
  }

  if (edf & 0x10) {
    result.steamid = extra.readBigUInt64LE(offset);
    offset += 8;
  }

  if (edf & 0x40) {
    result.tvport = extra.readInt16LE(offset);
    offset += 2;

    result.tvname = extra.slice(offset, extra.indexOf(0, offset));
    offset += result.tvname.length + 1;
    result.tvname = result.tvname.toString();
  }

  if (edf & 0x20) {
    const keywords = extra.slice(offset, extra.indexOf(0, offset));
    offset += keywords.length + 1;

    result.keywords = keywords.toString();
  }

  if (edf & 0x01) {
    result.gameid = extra.readBigUInt64LE(offset);
    offset += 8;
  }

  return result;
};

module.exports.players = async (address, port, timeout = 1000) => {
  const query = await challenge({ address, port: parseInt(port, 10) }, 'U', undefined, timeout);

  let offset = 5;
  const count = query.readInt8(offset);
  offset += 1;

  const result = [];
  for (let i = 0; i < count; i += 1) {
    const player = {};

    player.index = query.readInt8(offset);
    offset += 1;

    player.name = query.slice(offset, query.indexOf(0, offset));
    offset += player.name.length + 1;
    player.name = player.name.toString();

    player.score = query.readInt32LE(offset);
    offset += 4;

    player.duration = query.readFloatLE(offset);
    offset += 4;

    result.push(player);
  }

  return result;
};

module.exports.rules = async (address, port, timeout = 1000) => {
  const query = await challenge({ address, port: parseInt(port, 10) }, 'V', undefined, timeout);

  let offset = 0;
  const header = query.readInt32LE(offset);
  if (header === -2) throw new Error('Unsupported Response');
  offset += 4;

  offset += 1;

  const count = query.readInt16LE(offset);
  offset += 2;

  const result = [];
  for (let i = 0; i < count; i += 1) {
    const rule = {};

    rule.name = query.slice(offset, query.indexOf(0, offset));
    offset += rule.name.length + 1;
    rule.name = rule.name.toString();

    rule.value = query.slice(offset, query.indexOf(0, offset));
    offset += rule.value.length + 1;
    rule.value = rule.value.toString();

    result.push(rule);
  }

  return result;
};

module.exports.close = () => client.close();
