import {
  c32address,
  publicKeyToStxAddress,
  ripemd160,
  StacksNetworkVersion,
} from "micro-stacks/crypto";
import { getPublicKeyFromStacksPrivateKey } from "micro-stacks/transactions";
import { hashSha256 } from "micro-stacks/crypto-sha";
import * as secp from "@noble/secp256k1";
import { hexToBytes, bytesToHex } from "micro-stacks/common";
import { blake3 } from "hash-wasm";
const schnorr = secp.schnorr;

export function public2address(publicKey, mainnet) {
  const hash = ripemd160(hashSha256(publicKey));
  return c32address(
    mainnet
      ? StacksNetworkVersion.mainnetP2PKH
      : StacksNetworkVersion.testnetP2PKH,
    hash
  );
}

export function private2address(privateKey, mainnet) {
  return public2address(
    getPublicKeyFromStacksPrivateKey({
      data: hexToBytes(privateKey),
      compressed: true,
    }).data,
    mainnet
  );
}

export async function signSecp(privateKey, msgHash) {
  return await secp.sign(msgHash, privateKey, { recovered: true });
}

export async function verifySecpAddress(address, msgHash, signature) {
  let recovered = await secp.recoverPublicKey(msgHash, signature[0], signature[1]);
  recovered = recovered.substring(2, 66);
  recovered = ["02" + recovered, "03" + recovered];

  const recoveredAddresses = recovered.map((publicKey) =>
    publicKeyToStxAddress(publicKey)
  );

  if (recoveredAddresses.includes(address)) {
    if (await secp.verify(signature[0], msgHash, recovered[recoveredAddresses.indexOf(address)])) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export async function signSchnorr (privateKey, msgHash) {
  return await schnorr.sign(msgHash, privateKey);
}

export async function verifySchnorr (publicKey, msgHash, signature) {
  return await schnorr.verify(msgHash, signature, publicKey);
}

export async function blake3Hash(data, returnFormat) {
  switch (returnFormat) {
    case "hex":
      return await blake3(data);
    case "uint8array":
      return hexToBytes(await blake3(data));
    default:
      return await blake3(data);
  }
}

export function getSigningKey(privateKey) {
  const compressed = privateKey.endsWith("01");
  return compressed
    ? privateKey.substring(0, 64)
    : privateKey;
}