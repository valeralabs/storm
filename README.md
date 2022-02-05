<h1 align="center">Storm ⛈️</h1>

<h3 align="center">Storm is a user-friendly, cross-platform authenticator and wallet that runs in the terminal.</h3>

## Install

Storm is built in Node.js and is available on
[npm](https://npmjs.com/package/@syvita/storm).

You can install it with your favourite package manager.

1. Install Node.js 16 from [here](https://nodejs.org/en/download/).
2. Install PNPM like so:

```sh
curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
```

3. Install required dependencies and storm itself:

```sh
pnpm i -g esbuild @syvita/storm
```

4. Initialize storm by running and either set it up with a new key, or use one you already use in the Hiro Web Wallet:

```sh
storm init
```

**NOTE:** Storm is tested to work with Node.js 16 and nothing else, yet.
