export interface ConfigureType<T = unknown> {
  configure(): Promise<T>;
}

export interface RunnerType<T = unknown> extends ConfigureType {
  run(args?: string[]): Promise<T>;
}

export interface RunnableModule {
  default: {
    new (): RunnerType;
  };
}

export interface RunnerOptions {
  /**
   * @param {string} path - The path of the process to be executed.
   * @example
   * path: "./test/test-runner";
   */
  path: string;

  /**
   * @param {string[]} args - Optional arguments to be passed to the process.
   * @example
   * args: ["worker", -w];
   */
  args?: string[];

  /**
   * @param {boolean} forever - Indicates whether the process should run continuously.
   * @example
   * forever: false;
   */
  forever?: boolean;
}

export type RunnerActions = Record<string, RunnerOptions>;

export type RunnerActionsParallelism = Record<
  string,
  {
    /**
     * @param {boolean} parallelism - Indicates whether the actions must be executed simultaneously.
     * @example
     * parallelism: [
     *  {
     *    path: "./microservice1/runner",
     *    forever: true,
     *  },
     *  {
     *    path: "./test/test.runner",
     *    forever: true,
     *  },
     * ];
     */
    parallelism: RunnerOptions[];
  }
>;
