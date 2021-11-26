import prompts from "prompts";
import bip39 from "bip39";
import { getSecretKey } from "./vault";
import chalk from "chalk";

export async function promptPassword() {
    const { password } = await prompts({
        type: "password",
        name: "password",
        message: "Enter your password:",
        validate: async (old) => (bip39.validateMnemonic(await getSecretKey(old)) ? true : "Incorrect password")
    }).catch((err) => {
        console.log(chalk.red(err.message));
        process.exit(1);
    })
    return password;
}