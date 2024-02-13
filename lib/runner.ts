import {
  RunnerType,
  RunnerActions,
  RunnerOptions,
  RunnableModule,
  RunnerActionsParallelism,
} from "runner.type";

const isRunnerType = (runner: RunnerType): runner is RunnerType => {
  return (
    typeof runner.configure === "function" && typeof runner.run === "function"
  );
};

export class Runner {
  /**
   * Executes a set of actions defined by the provided parameters.
   * This method iterates over the actions and executes each one accordingly.
   * If an action specifies parallelism, it will execute the actions concurrently.
   *
   * @param {RunnerActions | RunnerActionsParallelism} actions - The set of actions to execute.
   */
  static async runnerActions(
    actions: RunnerActions | RunnerActionsParallelism
  ) {
    for (const key in actions) {
      const action = actions[key];

      if ("parallelism" in action && action.parallelism?.length) {
        await this.parallelism(...action.parallelism);
      } else {
        await this.exec(action as RunnerOptions);
      }
    }
  }

  /**
   * Loads a Runnable module from the specified path.
   * This method loads a module from the provided path and ensures that it exports
   * a default Runnable instance conforming to the RunnerType interface.
   * It initializes the Runnable instance, verifies its type, and then calls its
   * configure method before returning it.
   *
   * @param {string} path - The path to the Runnable module.
   */
  static async loadRunnableModule(path: string): Promise<RunnerType> {
    const module: RunnableModule = require(path);

    if (!("default" in module)) {
      throw Error(
        `Module ${path} does not export a default Runnable instance.`
      );
    }

    const Runnable = module.default;
    const runnable = new Runnable();

    if (!isRunnerType(runnable)) {
      throw Error(
        "The runnable object does not match the RunnerType interface."
      );
    }

    await runnable.configure();
    return runnable;
  }

  /**
   * Executes a single Runnable module with the provided options.
   * This method loads the specified module, initializes its Runnable instance,
   * and then executes it with the given arguments. It also handles logging
   * and error handling for the execution process.
   *
   * @template T - The type of data returned by the Runnable module.
   * @param {RunnerType<T>} runnable - The Runnable instance to execute.
   * @param {RunnerOptions} options - The options specifying the module path,
   * arguments, and other execution parameters.
   */
  static async run<T = unknown>(
    runnable: RunnerType<T>,
    options: RunnerOptions
  ) {
    try {
      const job = await runnable.run(options.args);
      if (options.forever) {
        console.info(`Loaded and running '${options.path}'...`);
        return job;
      } else {
        console.info(`Finished running '${options.path}'`);
      }
    } catch (err) {
      console.error(`Error running '${options.path}': ${err}`);
      process.exit(1);
    }
  }

  /**
   * Loads the specified runnable module and executes it with the provided options.
   * This method is responsible for loading the module and running it.
   *
   * @param {RunnerOptions} options - The options specifying the path and parameters for the runnable module.
   * @example
   * Runner.exec({
   *   path: `./worker/sync-database.worker`,
   *   forever: false,
   * })
   */
  static async exec(options: RunnerOptions): Promise<void> {
    const runnable = await this.loadRunnableModule(options.path);
    await this.run(runnable, options);
  }

  /**
   * Executes multiple Runnable modules in parallel.
   * This method allows running multiple Runnable modules concurrently,
   * each with its own set of options. It loads each module, initializes
   * its Runnable instance, and then executes them in parallel.
   *
   * @param {...RunnerOptions[]} options - An array of RunnerOptions objects,
   * each specifying the path to the module, arguments, and other options.
   *
   * @example
   * Runner.parallelism(
   *  {
   *    path: `./api/express-api`,
   *    args: extraParam,
   *    forever: false,
   *  },
   *  {
   *    path: "./graphql/apollo-runner",
   *    forever: true,
   *  }
   * )
   */
  static async parallelism(...options: RunnerOptions[]): Promise<void> {
    const configurations: Array<{
      runnable: RunnerType;
      option: RunnerOptions;
    }> = [];

    for (const option of options) {
      configurations.push({
        runnable: await this.loadRunnableModule(option.path),
        option,
      });
    }

    for (const configuration of configurations) {
      configuration.option.args = configuration.option.args || undefined;
      await this.run(configuration.runnable, configuration.option);
    }
  }
}
