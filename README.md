# Source Server Query

A library for querying Source servers using the [Source Query Protocol](https://developer.valvesoftware.com/wiki/Server_queries). Execute A2S_INFO, A2S_PLAYER, and A2S_RULES server queries. Responses will be returned in an array or object depending on the request. All methods are asynchronous resulting in a clean and easy way to query many servers one by one should it be necessary.

## Installing

You can add this module by running:

```
npm i source-server-query
```

and then use it:

```javascript
const { info, players, rules, close } = require("source-server-query");
```

## Usage

Each method: `info`, `players`, `rules`, uses the same arguments of an address and port. The port is the UDP query port, not the game port.

```javascript
info("9.9.9.9", 27015, timeout).then(console.log);
players("9.9.9.9", 27015, timeout).then(console.log);
rules("9.9.9.9", 27015, timeout).then(console.log);
```

The methods are promise based, so the `await` keyword can be used aswell. You can also close the client at any time.

```javascript
close();
```

For more information about each query request, as well as general source server information, see [index.d.ts](index.d.ts).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
