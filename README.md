# Source Server Query

A library for querying Source servers using the [Source Query Protocol](https://developer.valvesoftware.com/wiki/Server_queries). Execute A2S_INFO, A2S_PLAYER, and A2S_RULES server queries. Responses will be returned in an array or object depending on the request. All methods are asynchronous resulting in a clean and easy way to query many servers one by one should it be necessary.

## Installing

You can add this package to your own project using npm.

```
$ npm install source-server-query
```

Then load it into your own project. This project includes type declarations for Typescript.

```typescript
import query from 'source-server-query';

/* OR */

const query = require('source-server-query');
```

Or create the object using a constructor.

```typescript
import { SourceQuerySocket } from 'source-server-query';

const query: SourceQuerySocket = new SourceQuerySocket();

/* OR */

const { SourceQuerySocket } = require('source-server-query');

const query = new SourceQuerySocket();
```

## Usage

Each method, `info`, `players`, `rules`, uses the same arguments in the form of an address and port. The port is the UDP query port, not the game port. An optional timeout can be provided as well.

```javascript
query.info('127.0.0.1', 27015, 1000).then(console.log); // A2S_INFO

query.players('127.0.0.1', 27015, 1000).then(console.log); // A2S_PLAYER

query.rules('127.0.0.1', 27015, 1000).then(console.log); // A2S_RULES
```

The socket binding options can be configured through properties on the object, which include `port`, `address`, `exclusive`, and `fd`.

```javascript
socket.port = 8080;
socket.address = '127.0.0.1';
```

The socket opens and closes automatically, and whenever the socket is opened, the configuration is pushed to the socket. To force an update, close the current socket with the `close()` method. It will reopen with the updated values when the next request is sent.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
