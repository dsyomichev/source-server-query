# Source Server Query

A library for querying Source servers using the [Source Query Protocol](https://developer.valvesoftware.com/wiki/Server_queries). Execute A2S_INFO, A2S_PLAYER, and A2S_RULES server queries. Responses will be returned in an array or object depending on the request. All methods are asynchronous resulting in a clean and easy way to query many servers one by one should it be necessary.

## Installing

You can add this package to your own project using npm.

```
$ npm install source-server-query
```

Then load it into your own project. This project includes type declarations for Typescript.

```typescript
import { info, players, rules, close } from "source-server-query";

/* OR */

const { info, players, rules, close } = require("source-server-query");
```

## Usage

Each method, `info`, `players`, `rules`, uses the same arguments in the form of an address and port. The port is the UDP query port, not the game port. An optional timeout can be provided as well.

```javascript
info("0.0.0.0", 27015, timeout).then(console.log);

players("0.0.0.0", 27015, timeout).then(console.log);

rules("0.0.0.0", 27015, timeout).then(console.log);
```

The methods are promise based, so the `await` keyword can be used aswell. You can also close the client at any time.

```javascript
close();
```

For more information about each query request, as well as general source server information, see [index.d.ts](index.d.ts).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
