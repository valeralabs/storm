import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import Conf from "conf";
import { checkApi } from "../../lib/api";

const config = new Conf({
  projectName: 'storm'
});

export default async function configApi() {
  // log the current api with individually coloured protocol, host and port
  console.log(
    `Current API:`,
    chalk.magenta(config.get("api.protocol")) +
      `://` +
      chalk.magenta(config.get("api.host")) +
      `:` +
      chalk.magenta(config.get("api.port"))
  );

  await prompts([
    {
      type: "select",
      name: "protocol",
      message: "Select protocol",
      choices: [
        { title: "HTTP", value: "http" },
        { title: "HTTPS", value: "https" },
      ],
      initial: 1,
    },
    {
      type: "text",
      name: "host",
      message: "Enter the bvAPI server",
      initial: config.get("api.host", "mainnet.syvita.org"),
    },
    {
      type: "number",
      name: "port",
      message: "Enter the API port",
      initial: config.get("api.port", "443"),
    },
  ]).then(async ({ protocol, host, port }) => {
    const spinner = ora("Checking API").start();
    await checkApi(protocol, host, port)
      .catch((err) => {
        spinner.fail(`${err}`);
      })
      .then((working) => {
        if (working) {
          spinner.succeed("API online");
          config.set("api.protocol", protocol);
          config.set("api.host", host);
          config.set("api.port", port);
          console.log(chalk.green("API configured successfully"));
        } else {
          spinner.fail("API offline");
          console.log(chalk.yellow("API wasn't changed"));
        }
      });
  });
}
