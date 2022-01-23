declare module "source-server-query" {
  /**
   * The response received with an AS2_INFO query. Uses descriptions for data from https://developer.valvesoftware.com/wiki/Server_queries.
   * This also contains more information about each item.
   */
  export interface InfoResponse {
    protocol: number /* Protocol version used by the server. */;
    name: string /* Name of the server. */;
    map: string /* Map the server has currently loaded. */;
    folder: string /* Name of the folder containing the game files. */;
    game: string /* Full name of the game. */;
    id: number /* Steam Application ID of game. */; // https://developer.valvesoftware.com/wiki/Steam_Application_ID
    players: number /* Number of players on the server. */;
    maxplayers: number /* Maximum number of players the server reports it can hold. */;
    bots: number /* Number of bots on the server. */;
    servertype: string /* Indicates the type of server. */;
    environment: string /* Indicates the operating system of the server. */;
    visibility: number /* Indicates whether the server requires a password. */;
    vac: number /* Specifies whether the server uses VAC. */;
    version: string /* Version of the game installed on the server. */;
    port?: number /* The server's game port number. */;
    steamid?: [number, number, true] /* Server's SteamID. */; // See below about int64 in JS.
    tvport?: number /* Spectator port number for SourceTV. */;
    tvname?: number /* Name of the spectator server for SourceTV. */;
    keywords: string /* Tags that describe the game according to the server (for future use.) */; // Unsure if always comma separated so leaving as string.
    gameid: [number, number, true] /* The server's 64-bit GameID. */;
  }

  /**
   * JavaScript 64 Bit Integers:
   * Since the number precision is not high enough to store 64 bit numbers, it is provided in the format used by most number libraries including Long.js
   * https://github.com/dcodeIO/Long.js/, see https://www.w3schools.com/js/js_numbers.asp for more info.
   * This comes from the jspack library. https://github.com/birchroad/node-jspack
   */

  /**
   * Query various server configuration information.
   *
   * @param address - Address of the source server.
   * @param port - The UDP query port of the server. NOT the game port.
   * @param timeout - Timeout for the request in MS.
   */
  export function info(
    address: string,
    port: number,
    timeout: number = 1000
  ): Promise<InfoResponse>;

  /*
   * The response recevied from an A2S_PLAYER query.
   */
  export type PlayersResponse = {
    index: number /* Index of player chunk starting from 0. */;
    name: string /* Name of the player. */; // This is NOT the players SteamID.
    score: number /* Player's score. */;
    duration: number /* Time (in seconds) player has been connected to the server. */;
  }[];

  /**
   * Query a list of players connected to the server.
   *
   * @param address - Address of the source server.
   * @param port - The UDP query port of the server. NOT the game port.
   * @param timeout - Timeout for the request in MS.
   */
  export function players(
    address: string,
    port: number,
    timeout: number = 1000
  ): Promise<PlayersResponse>;

  /*
   * The response recevied from an A2S_RULES query.
   */
  export type RulesResponse = {
    name: string /* Name of the rule. */;
    value: string /* Value of the rule. */;
  }[];

  /**
   * Query a list of rules the server is currently using.
   *
   * @param address - Address of the source server.
   * @param port - The UDP query port of the server. NOT the game port.
   * @param timeout - Timeout for the request in MS.
   */
  export function rules(
    address: string,
    port: number,
    timeout: number = 1000
  ): Promise<RulesResponse>;

  export function close(): void;
}
