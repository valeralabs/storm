import fetch from "node-fetch";
import Conf from 'conf'
const conf = new Conf({
    projectName: 'storm'
});

const baseUrl = `${conf.get('api.protocol')}://${conf.get('api.host')}:${conf.get('api.port')}`;

export async function checkApi(protocol, host, port) {
    const url = `${protocol}://${host}:${port}/extended/v1/status`;
    const response = await fetch(url);
    const json = await response.json();
    return json.status === "ready";
}

export async function getBnsName (address) {
    const url = `${baseUrl}/v1/addresses/stacks/${address}`;
    const response = await fetch(url);
    const json = await response.json();
    return json.names[0];
}