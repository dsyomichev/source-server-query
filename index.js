const bp = require("bufferpack");
const jsp = require("jspack").jspack;

const client = require("dgram").createSocket("udp4");

const send = (request, remote, timeout) => {
  return new Promise((resolve, reject) => {
    const onTimeout = setTimeout(() => {
      client.removeListener("message", onResponse);
      return reject(new Error("Request timeout out."));
    }, timeout);

    const onResponse = (response, rinfo) => {
      if (rinfo.address != rinfo.address || rinfo.port != rinfo.port) return;

      client.removeListener("message", onResponse);
      clearTimeout(onTimeout);
      return resolve(response);
    };

    client.on("message", onResponse);
    client.send(request, remote.port, remote.address);
  });
};

const challenge = async (remote, format, payload, timeout) => {
  let request = bp.pack(format, payload);
  const response = await send(request, remote, timeout);

  if (bp.unpack("<s", response, 4)[0] === "A") {
    const code = bp.unpack("<i", response, 5)[0];
    request = bp.pack("<isi", [-1, payload[1], code]);
    return await send(request, remote, timeout);
  } else return response;
};

module.exports.info = async (address, port, timeout = 1000) => {
  const query = await challenge(
    { address, port },
    "<isSi",
    [-1, "T", "Source Engine Query", -1],
    timeout
  );

  const format = `<
    B(protocol)
    S(name)
    S(map)
    S(folder)
    S(game)
    h(id)
    B(players)
    B(maxplayers)
    B(bots)
    c(servertype)
    c(environment)
    B(visibility)
    B(vac)
    S(version)`;

  const info = bp.unpack(format, query.slice(4));
  const extra = query.slice(bp.calcLength(format, Object.values(info)) + 4);

  if (extra.length < 1) return data;

  let offset = 1;
  const edf = bp.unpack("<B", extra)[0];

  if (edf & 0x80) {
    info.port = bp.unpack("<h", extra, offset)[0];
    offset += 2;
  }

  if (edf & 0x10) {
    info.steamid = jsp.Unpack("<Q", extra, offset)[0];
    offset += 8;
  }

  if (edf & 0x40) {
    const tvinfo = bp.unpack("<hS", extra, offset);
    info.tvport = tvinfo[0];
    info.tvname = tvinfo[1];
    offset += bp.calcLength("<hS", tvinfo);
  }

  if (edf & 0x20) {
    info.keywords = bp.unpack("<S", extra, offset)[0].split(",");
    offset += bp.calcLength("<S", info.keywords);
  }

  if (edf & 0x01) {
    info.gameid = jsp.Unpack("<Q", extra, offset)[0];
    offset += 4;
  }

  return info;
};

module.exports.players = async (address, port, timeout = 1000) => {
  const response = await challenge(
    { address, port },
    "<isi",
    [-1, "U", -1],
    timeout
  );

  const count = bp.unpack("<B", response, 5)[0];
  let offset = 6;

  const players = [];
  const format = "<b(index)S(name)i(score)f(duration)";

  for (let i = 0; i < count; i++) {
    const player = bp.unpack(format, response, offset);

    offset += bp.calcLength(format, Object.values(player));
    players.push(player);
  }

  return players;
};

module.exports.rules = async (address, port, timeout = 1000) => {
  const response = await challenge(
    { address, port },
    "<isi",
    [-1, "V", -1],
    timeout
  );

  const count = bp.unpack("<h", response, 5)[0];
  let offset = 7;

  const rules = [];
  const format = "<S(name)S(value)";

  for (let i = 0; i < count; i++) {
    const rule = bp.unpack(format, response, offset);

    offset += bp.calcLength(format, Object.values(rule));
    rules.push(rule);
  }

  return rules;
};

module.exports.close = () => client.close();
