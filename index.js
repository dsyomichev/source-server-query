const bp = require("bufferpack");
const client = require("dgram").createSocket("udp4");

const send = (buffer, address, port, code, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    if (!buffer || !buffer instanceof Buffer) return reject(new Error("Missing/Invalid param 'buffer'"));
    if (!address || typeof address != "string") return reject(new Error("Missing/Invalid param 'address'"));
    if (!port || typeof port != "number") return reject(new Error("Missing/Invalid param 'port'"));
    if (!code || typeof code != "string") return reject(new Error("Missing/Invalid param 'code'"));
    if (typeof timeout != "number") return reject(new Error("Invalid Param 'timeout'"));

    client.send(buffer, 0, buffer.length, port, address, (err, bytes) => {
      if (err) return reject(typeof err == "string" ? new Error(err) : err);

      let response = (buffer, remote) => {
        //Any unmatched parameter will return rather than error so that multiple requests can be made at once.
        if (remote.address != address) return;
        if (remote.port != port) return;
        if (buffer.length < 1) return;
        buffer = buffer.slice("4");
        if (bp.unpack("<s", buffer)[0] !== code) return;
        client.removeListener("message", response);
        clearTimeout(time);
        return resolve(buffer.slice(1));
      };

      let time = setTimeout(() => {
        client.removeListener("message", response);
        return reject(new Error("Connection timed out."));
      }, timeout);

      client.on("message", response);
    });
  });
};

const challenge = async (address, port, code, timeout = 1000) => {
  if (!address || typeof address != "string") return new Error("Missing/Invalid param 'address'");
  if (!port || typeof port != "number") return new Error("Missing/Invalid param 'port'");
  if (!code || typeof code != "string") return new Error("Missing/Invalid param 'code'");
  if (typeof timeout != "number") return new Error("Invalid Param 'timeout'");

  let buffer = send(bp.pack("<isi", [-1, code, -1]), address, port, "A", timeout);
  try {
    buffer = await buffer;
  } catch (err) {
    return typeof err == "string" ? new Error(err) : err;
  }
  return bp.unpack("<i", buffer)[0];
};

const info = async (address, port, timeout = 1000) => {
  if (!address || typeof address != "string") return new Error("Missing/Invalid param 'address'");
  if (!port || typeof port != "number") return new Error("Missing/Invalid param 'port'");
  if (typeof timeout != "number") return new Error("Invalid Param 'timeout'");

  let buffer = send(bp.pack("<isS", [-1, "T", "Source Engine Query"]), address, port, "I", timeout);
  try {
    buffer = await buffer;
  } catch (err) {
    return typeof err == "string" ? new Error(err) : err;
  }

  let list = bp.unpack("<bSSSShBBBssBB", buffer);
  let keys = ["protocol", "name", "map", "folder", "game", "appid", "playersnum", "maxplayers", "botsnum", "servertype", "environment", "visibility", "vac"];
  let info = {};
  for (let i = 0; i < list.length; i++) {
    info[keys[i]] = list[i];
  }

  buffer = buffer.slice(bp.calcLength("<bSSSShBBBssBB", list));
  info.version = bp.unpack("<S", buffer)[0];
  buffer = buffer.slice(bp.calcLength("<S", [info.version]));

  if (buffer.length > 1) {
    let offset = 0;
    let EDF = bp.unpack("<b", buffer)[0];
    offset += 1;
    if ((EDF & 0x80) !== 0) {
      info.port = bp.unpack("<h", buffer, offset)[0];
      offset += 2;
    }
    if ((EDF & 0x10) !== 0) {
      info.steamID = bp.unpack("<ii", buffer, offset)[0];
      offset += 8;
    }
    if ((EDF & 0x40) !== 0) {
      let tvinfo = bp.unpack("<hS", buffer, offset);
      info["tv-port"] = tvinfo[0];
      info["tv-name"] = tvinfo[1];
      offset += bp.calcLength("<hS", tvinfo);
    }
    if ((EDF & 0x20) !== 0) {
      info.keywords = bp.unpack("<S", buffer, offset)[0];
      offset += bp.calcLength("<S", info.keywords);
    }
    if ((EDF & 0x01) !== 0) {
      info.gameID = bp.unpack("<i", buffer, offset)[0];
      offset += 4;
    }
  }

  return info;
};

const players = async (address, port, timeout = 1000) => {
  if (!address || typeof address != "string") return new Error("Missing/Invalid param 'address'");
  if (!port || typeof port != "number") return new Error("Missing/Invalid param 'port'");
  if (typeof timeout != "number") return new Error("Invalid Param 'timeout'");

  let key = challenge(address, port, "U", timeout);
  try {
    key = await key;
  } catch (err) {
    return typeof err == "string" ? new Error(err) : err;
  }

  let buffer = send(bp.pack("<isi", [-1, "U", key]), address, port, "D", timeout);
  try {
    buffer = await buffer;
  } catch (err) {
    return typeof err == "string" ? new Error(err) : err;
  }

  let count = bp.unpack("<B", buffer)[0];
  let offset = 1;
  let players = [];
  let keys = ["index", "name", "score", "duration"];
  while (offset <= buffer.byteLength) {
    let list = bp.unpack("<bSif", buffer, offset);
    if (list === undefined) {
      break;
    }
    let player = {};
    for (let i = 0; i < list.length; i++) {
      player[keys[i]] = list[i];
    }
    offset += bp.calcLength("<bSif", list);
    players.push(player);
  }
  return players;
};

const rules = async (address, port, timeout = 1000) => {
  if (!address || typeof address != "string") return new Error("Missing/Invalid param 'address'");
  if (!port || typeof port != "number") return new Error("Missing/Invalid param 'port'");
  if (typeof timeout != "number") return new Error("Invalid Param 'timeout'");

  let key = challenge(address, port, "V", timeout);
  try {
    key = await key;
  } catch (err) {
    return typeof err == "string" ? new Error(err) : err;
  }

  let buffer = send(bp.pack("<isi", [-1, "V", key]), address, port, "E", timeout);
  try {
    buffer = await buffer;
  } catch (err) {
    return typeof err == "string" ? new Error(err) : err;
  }

  let count = bp.unpack("<h", buffer)[0];
  let rules = [];
  let keys = ["name", "value"];
  let offset = 2;
  for (let i = 0; i < count; i++) {
    let list = bp.unpack("<SS", buffer, offset);
    let rule = {};
    for (let i = 0; i < list.length; i++) {
      rule[keys[i]] = list[i];
    }
    rules.push(rule);
    offset += bp.calcLength("<SS", list);
  }

  return rules;
};

const destroy = () => client.close();

module.exports = { info, players, rules, destroy };
