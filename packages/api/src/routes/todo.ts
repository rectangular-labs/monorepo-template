import { type } from "arktype";
import { base } from "../context";

export const todoSchema = type({
  id: "number",
  name: "string",
});

const todos = [
  { id: 1, name: "Get groceries" },
  { id: 2, name: "Buy a new phone" },
  { id: 3, name: "Finish the project" },
];
const list = base
  .route({
    method: "GET",
    path: "/",
  })
  .input(
    type({
      limit: "1<=number<=100",
      cursor: "number",
    }),
  )
  .output(todoSchema.array())
  .handler(({ input, context }) => {
    // Example: Access context properties (DB, headers, cookies)
    console.log("User-Agent:", context.reqHeaders?.get("user-agent"));
    console.log("Database available:", !!context.db);

    return todos.slice(
      input.cursor ?? 0,
      (input.cursor ?? 0) + (input.limit ?? 10),
    );
  });
const find = base
  .route({
    method: "GET",
    path: "/{id}",
  })
  .input(
    type({
      id: "number",
    }),
  )
  .output(todoSchema)
  .handler(({ input, context }) => {
    // Example: Access database and other context
    const todo = todos.find((t) => t.id === input.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Context is now available for database operations, logging, etc.
    console.log(
      "Finding todo with ID:",
      input.id,
      "DB available:",
      !!context.db,
    );

    return todo;
  });
const create = base
  .route({
    method: "POST",
    path: "/",
  })
  .input(
    type({
      name: "string",
      description: "string",
    }),
  )
  .output(
    todoSchema.merge(
      type({
        description: "string",
      }),
    ),
  )
  .handler(({ input, context }) => {
    const newTodo = { id: todos.length + 1, ...input };
    todos.push(newTodo);

    // Example: Use context for database operations, logging user info, etc.
    console.log("Creating todo:", newTodo);
    console.log("Database available:", !!context.db);

    return newTodo;
  });

export default base.prefix("/todos").router({
  list,
  find,
  create,
});
