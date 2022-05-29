import dgram, { BindOptions, Socket } from 'dgram';
import { AddressInfo } from 'net';

export class SourceQuerySocket {
  public port?: number;

  public address?: string;

  public exclusive?: boolean;

  public fd?: number;

  private socket?: Socket;

  public constructor(options: BindOptions = {}) {
    if (options.port !== undefined) this.port = options.port;
    if (options.address !== undefined) this.address = options.address;
    if (options.exclusive !== undefined) this.exclusive = options.exclusive;
    if (options.fd !== undefined) this.fd = options.fd;
  }

  private bind(): Promise<void> {
    return new Promise((resolve, reject): void => {
      const error = (err: unknown): void => {
        this.socket?.close();
        return reject(err);
      };

      const listening = (): void => {
        this.socket?.removeListener('error', error);
        return resolve();
      };

      this.socket = dgram.createSocket('udp4');

      this.socket.once('error', error);
      this.socket.once('listening', listening);

      this.socket.bind({ port: this.port, address: this.address, exclusive: this.exclusive, fd: this.fd });
    });
  }

  private assert(): Promise<void> {
    return new Promise(async (resolve, reject): Promise<void> => {
      if (this.socket === undefined) {
        try {
          await this.bind();
        } catch (err) {
          return reject(err);
        }

        return resolve();
      }

      try {
        this.socket?.address();
      } catch (err: unknown) {
        return this.socket?.once('listening', () => resolve()) as unknown as void;
      }

      return resolve();
    });
  }

  private close(): void {
    this.socket?.close();
    this.socket = undefined;
  }

  private validate(einfo: AddressInfo, rinfo: AddressInfo, request: Buffer, response: Buffer): boolean {
    if (rinfo.port !== einfo.port) return false;
    if (rinfo.address !== einfo.address) return false;

    return true;
  }

  private send(einfo: AddressInfo, request: Buffer, duration: number): Promise<Buffer> {
    return new Promise(async (resolve, reject): Promise<void> => {
      try {
        await this.assert();
      } catch (err) {
        return reject(err);
      }

      const timeout: NodeJS.Timeout = setTimeout((): void => {
        this.socket?.removeListener('message', message);
        return reject(new Error(`Request timed out. [${duration}ms]`));
      }, duration);

      const message = (response: Buffer, rinfo: AddressInfo): void => {
        if (this.validate(einfo, rinfo, request, response) === false) return;

        clearTimeout(timeout);
        this.socket?.removeListener('message', message);
        if (this.socket?.listenerCount('message') === 0) this.close();

        return resolve(response);
      };

      this.socket?.on('message', message);
      this.socket?.send(request, einfo.port, einfo.address, (err): void => {
        if (err !== undefined && err !== null) return reject(err);
      });
    });
  }

  private pack(header: string, payload?: string, challenge?: number): Buffer {
    const preamble: Buffer = Buffer.alloc(4);
    preamble.writeInt32LE(-1, 0);

    const request: Buffer = Buffer.from(header);

    const data: Buffer = payload ? Buffer.concat([Buffer.from(payload), Buffer.alloc(1)]) : Buffer.alloc(0);

    let prologue: Buffer = Buffer.alloc(0);
    if (challenge !== undefined) {
      prologue = Buffer.alloc(4);
      prologue.writeInt32LE(challenge);
    }

    return Buffer.concat([preamble, request, data, prologue, preamble]);
  }

  private async solicit(
    einfo: AddressInfo,
    header: string,
    payload: string | undefined,
    duration: number
  ): Promise<Buffer> {
    const request: Buffer = this.pack(header, payload);
    const challenge: Buffer = await this.send(einfo, request, duration);
    const type: string = challenge.slice(4, 5).toString();

    if (type === 'A') {
      const challenger: number = challenge.readInt32LE(5);
      const result: Buffer = this.pack(header, payload, challenger);

      return await this.send(einfo, result, duration);
    }

    return challenge;
  }

  public async info(address: string, port: number | string, timeout: number = 1000) {
    const query: Buffer = await this.solicit(
      { address, port: parseInt(port as string, 10), family: '' },
      'T',
      'Source Engine Query',
      timeout
    );

    const result: Record<string, any> = {};
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

    const extra: Buffer = query.slice(offset);

    offset = 0;
    if (extra.length < 1) return result;

    const edf: number = extra.readInt8(offset);
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
      const keywords: Buffer = extra.slice(offset, extra.indexOf(0, offset));
      offset += keywords.length + 1;

      result.keywords = keywords.toString();
    }

    if (edf & 0x01) {
      result.gameid = extra.readBigUInt64LE(offset);
      offset += 8;
    }

    return result;
  }

  public async players(address: string, port: number | string, timeout: number = 1000) {
    const query: Buffer = await this.solicit(
      { address, port: parseInt(port as string, 10), family: '' },
      'U',
      undefined,
      timeout
    );

    let offset = 5;
    const count: number = query.readInt8(offset);
    offset += 1;

    const result: Record<string, string | number>[] = [];
    for (let i = 0; i < count; i += 1) {
      const player: Record<string, any> = {};

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
  }

  public async rules(address: string, port: string | number, timeout = 1000) {
    const query: Buffer = await this.solicit(
      { address, port: parseInt(port as string, 10), family: '' },
      'V',
      undefined,
      timeout
    );

    let offset = 0;
    const header: number = query.readInt32LE(offset);
    if (header === -2) throw new Error('Unsupported response received.');
    offset += 4;

    offset += 1;

    const count: number = query.readInt16LE(offset);
    offset += 2;

    const result: Record<string, string>[] = [];
    for (let i = 0; i < count; i += 1) {
      const rule: Record<string, any> = {};

      rule.name = query.slice(offset, query.indexOf(0, offset));
      offset += rule.name.length + 1;
      rule.name = rule.name.toString();

      rule.value = query.slice(offset, query.indexOf(0, offset));
      offset += rule.value.length + 1;
      rule.value = rule.value.toString();

      result.push(rule);
    }

    return result;
  }
}

export default new SourceQuerySocket();
