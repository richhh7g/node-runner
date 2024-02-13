# NodeJs Runner Typescript

## Description

Node runner is a powerful tool developed to optimize and speed up the process execution flow in your applications. It supports single, parallel and sequential execution, in addition to having a process orchestrator, ensuring efficient task management, high performance and scalability.
Node Runner has a flexible, easy-to-integrate architecture that makes it the ideal choice for handling multiple operations, enabling your application to achieve higher levels of efficiency and responsiveness. Develop, execute and manage processes in an uncomplicated way.

## Install

```sh
npm i node-runner-ts
```

## Usage

Import the library in your code

```ts
import { Runner } from "node-runner-ts";
```

### Create runner class

Customize your runner according to your needs, use the implementation of the RunnerType interface to define the mandatory methods, the class must be exported as standard, otherwise it will not be interpreted.

```ts
import { RunnerType } from "node-runner-ts";

export default class MyRunner implements RunnerType {
  async configure() {
    // Config dependencies
  }

  async run() {
    // Main logic to be executed when the executor is triggered.
  }
}
```

### Runner methods

#### Exec

The `Runner.exec` method is designed to run a single specified process or module

```ts
import { Runner } from "node-runner-ts";

void Runner.exec({
  path: path.resolve(__dirname, "app", "server.runner.ts"),
  forever: true,
});
```

#### Parallelism

The `Runner.parallelism` method allows you to run multiple processes or modules simultaneously, improving efficiency and performance.

```ts
import { Runner } from "node-runner-ts";

void Runner.parallelism(
  {
    path: path.resolve(__dirname, "app", "server.runner.ts"),
    forever: true,
  },
  {
    path: path.resolve(__dirname, "worker", "worker.ts"),
    forever: false,
  }
);
```

### Actions

Use a runner action to orchestrate and run your modules/processes.

#### Default

The default action orchestrator.

```ts
void Runner.runnerActions({
  test: {
    path: "./test/test.runner",
    forever: true,
  },
});
```

#### Parallelism

Have one or more actions run modules in parallel.

```ts
void Runner.runnerActions({
  server: {
    parallelism: [
      {
        path: "./app/run",
        forever: true,
      },
      {
        path: "./test/test.runner",
        forever: true,
      },
    ],
  },
});
```

#### Custom actions

Create your own orchestrator according to your needs.

```ts
import path from "node:path";
import { Runner, RunnerOptions } from "node-runner-ts";

export enum ActionType {
  Test = "Test",
  Server = "Server",
  MicroserviceEmail = "MicroserviceEmail",
  ApolloGraphql = "ApolloGraphql",
}

const OPTIONS: Record<string, RunnerOptions> = {
  [ActionType.ApolloGraphql]: {
    path: path.resolve(__dirname, "app", "graphql", "graphql.runner.ts"),
    forever: true,
  },
  [ActionType.MicroserviceEmail]: {
    path: path.resolve(__dirname, "microservice", "setup.ts"),
    forever: true,
  },
  [ActionType.Test]: {
    path: "./test/test-runner",
    forever: false,
  },
};

const customActions = async (action: ActionType): Promise<void> => {
  switch (action) {
    case ActionType.ApolloGraphql:
    case ActionType.MicroserviceEmail:
      return Runner.parallelism(
        OPTIONS[ActionType.ApolloGraphql],
        OPTIONS[ActionType.MicroserviceEmail]
      );
    default:
      return Runner.exec(OPTIONS[ActionType.Test]);
  }
};
```
