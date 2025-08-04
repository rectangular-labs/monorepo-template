import { os } from "@orpc/server";
import { type } from "arktype";

const todos = [
  { id: 1, name: "Get groceries" },
  { id: 2, name: "Buy a new phone" },
  { id: 3, name: "Finish the project" },
];
const list = os
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
  .handler(({ input }) => {
    return todos.slice(
      input.cursor ?? 0,
      (input.cursor ?? 0) + (input.limit ?? 10),
    );
  });
const find = os
  .route({
    method: "GET",
    path: "/{id}",
  })
  .input(
    type({
      id: "number",
    }),
  )
  .handler(({ input }) => {
    const todo = todos.find((t) => t.id === input.id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    return todo;
  });
const create = os
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
  .handler(({ input }) => {
    const newTodo = { id: todos.length + 1, ...input };
    todos.push(newTodo);
    console.log("newTodo", newTodo);

    return newTodo;
  });

export default os.prefix("/todos").router({
  list,
  find,
  create,
});
