import chalk from "chalk";
import prompts from "prompts";
import { deleteSecretKey } from "../lib/vault";

export async function deleteKey() {
    const response = await prompts({
        type: "confirm",
        name: "value",
        message: "Are you sure you want to reset Storm?",
        initial: false
    });
    if (response.value) {
        await deleteSecretKey();
        console.log(chalk.green("Successfully deleted Storm key"));
    } else {
        console.log(chalk.red("Cancelled"));
    }
}