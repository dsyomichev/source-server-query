const bp = require("bufferpack");
const jsp = require("jspack").jspack;

const client = require("dgram").createSocket("udp4");

const send = (buffer, address, port, codes, timeout) => {
  return new Promise((resolve, reject) => {
    let time = setTimeout(() => {
      client.removeListener("message", response);
      return reject(new Error("Request timed out."));
    }, timeout);

    let response = (buffer, remote) => {
      if (remote.address != address || remote.port != port) return;
      if (buffer.length < 1) return;
      if (!codes.includes(bp.unpack("<s", buffer, 4)[0])) return;
      client.removeListener("message", response);
      clearTimeout(time);
      return resolve(buffer.slice(5));
    };

    client.on("message", response);

    client.send(buffer, 0, buffer.length, port, address);
  });
};

module.exports.info = async (address, port, timeout = 1000) => {
  let buffer = bp.pack("<isSi", [-1, "T", "Source Engine Query", -1]);
  buffer = await send(buffer, address, port, "AI", timeout);

  if (bp.unpack("<s", buffer)[0] == "A") {
    let challenge = bp.unpack("<i", buffer, 1)[0];
    buffer = bp.pack("<isSi", [-1, "T", "Source Engine Query", challenge]);
    buffer = await send(buffer, address, port, "I", timeout);
  }

  const format =
    "<B(protocol)S(name)S(map)S(folder)S(game)h(id)B(players)B(maxplayers)B(bots)c(servertype)c(environment)B(visibility)B(vac)S(version)";
  const info = bp.unpack(format, buffer);
  buffer = buffer.slice(bp.calcLength(format, Object.values(info)));

  if (buffer.length > 1) {
    let offset = 1;
    const EDF = bp.unpack("<B", buffer)[0];

    if ((EDF & 0x80) !== 0) {
      info.port = bp.unpack("<h", buffer, offset)[0];
      offset += 2;
    }

    if ((EDF & 0x10) !== 0) {
      info.steamid = jsp.Unpack("<Q", buffer, offset)[0];
      offset += 8;
    }

    if ((EDF & 0x40) !== 0) {
      const tvinfo = bp.unpack("<h(tvport)S(tvname)", buffer, offset);
      info = { ...info, ...tvinfo };
      offset += bp.calcLength("<hS", tvinfo);
    }

    if ((EDF & 0x20) !== 0) {
      info.keywords = bp.unpack("<S", buffer, offset)[0];
      offset += bp.calcLength("<S", info.keywords);
    }

    if ((EDF & 0x01) !== 0) {
      info.gameid = jsp.Unpack("<Q", buffer, offset)[0];
      offset += 4;
    }
  }

  return info;
};

const challenge = async (address, port, code, timeout) => {
  let buffer;

  buffer = bp.pack("<isi", [-1, code, -1]);
  buffer = await send(buffer, address, port, "A", timeout);

  return bp.unpack("<i", buffer)[0];
};

module.exports.players = async (address, port, timeout = 1000) => {
  const key = await challenge(address, port, "U", timeout);

  let buffer = bp.pack("<isi", [-1, "U", key]);
  buffer = await send(buffer, address, port, "D", timeout);

  const count = bp.unpack("<B", buffer)[0];
  let offset = 1;

  const players = [];

  for (let i = 0; i < count; i++) {
    const format = "<b(index)S(name)i(score)f(duration)";
    const player = bp.unpack(format, buffer, offset);

    offset += bp.calcLength(format, Object.values(player));
    players.push(player);
  }

  return players;
};

module.exports.rules = async (address, port, timeout = 1000) => {
  const key = await challenge(address, port, "V", timeout);

  let buffer = bp.pack("<isi", [-1, "V", key]);
  buffer = await send(buffer, address, port, "E", timeout);

  const count = bp.unpack("<h", buffer)[0];
  let offset = 2;

  const rules = [];

  for (let i = 0; i < count; i++) {
    const rule = bp.unpack("<S(name)S(value)", buffer, offset);

    offset += bp.calcLength("<S(name)S(value)", Object.values(rule));
    rules.push(rule);
  }

  return rules;
};

module.exports.close = () => client.close();
