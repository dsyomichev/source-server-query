# Source Server Query

A library for querying Source servers using the [Source Query Protocol](https://developer.valvesoftware.com/wiki/Server_queries). Execute A2S_INFO, A2S_PLAYER, and A2S_RULES server queries. Responses will be returned in an array or object depending on the request. All methods are asynchronous resulting in a clean and easy way to query many servers one by one should it be necessary.

## Installing

You can add this module by running:

```
yarn add source-server-query
```

OR

```
npm i source-server-query
```

and then requiring it using:

```javascript
const query = require("source-server-query");
```

## Methods

### `info(address, <port, [timeout]>) => Promise<{}>`

Returns information from an A2S_INFO query.

**Params:**

* address - The IP address of the Source server.
* port - The port of the Source server.
* timeout - The timeout before an error is thrown. Defaults to 1000ms.

**Example:**

```javascript
const query = require("source-query");
query
  .info("85.190.158.37", 27015, 2000)
  .then(console.log)
  .catch(console.log);
```

### `players(address, <port, [timeout]>) => Promise<[]>`

Returns players from an A2S_PLAYER query.

**Params:**

* address - The IP address of the Source server.
* port - The port of the Source server.
* timeout - The timeout before an error is thrown. Defaults to 1000ms.

**Example:**

```javascript
const query = require("source-query");
query
  .players("85.190.158.37", 27015, 2000)
  .then(console.log)
  .catch(console.log);
```

### `rules(address, <port, [timeout]>) => Promise<[]>`

Returns rules from an A2S_RULES query.

**Params:**

* address - The IP address of the Source server.
* port - The port of the Source server.
* timeout - The timeout before an error is thrown. Defaults to 1000ms.

**Example:**

```javascript
const query = require("source-query");
query
  .rules("85.190.158.37", 27015, 2000)
  .then(console.log)
  .catch(console.log);
```

### `destroy() => void`

Closes the Dgram client in order to shutdown the program gracefully.

**Params:** None

**Example:**

```javascript
const query = require("source-query");
query
  .info("85.190.158.37", 27015)
  .then(console.log)
  .catch(console.log)
  .then(query.close);
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
