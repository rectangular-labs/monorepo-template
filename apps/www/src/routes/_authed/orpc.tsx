import { ThemeToggle } from "@rectangular-labs/ui/components/theme-provider";
import { Button } from "@rectangular-labs/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rectangular-labs/ui/components/ui/card";
import { Input } from "@rectangular-labs/ui/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { LogoutButton } from "~/components/logout-button";
import { getRqHelper } from "~/lib/api";

export const Route = createFileRoute("/_authed/orpc")({
  component: ORPCTodos,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      getRqHelper().todos.list.queryOptions({
        input: {
          limit: 10,
          cursor: 0,
        },
      }),
    );
  },
});

function ORPCTodos() {
  const { data, refetch } = useQuery(
    getRqHelper().todos.list.queryOptions({
      input: {
        cursor: 0,
        limit: 10,
      },
    }),
  );

  const [todo, setTodo] = useState("");
  const { mutate: addTodo } = useMutation(
    getRqHelper().todos.create.mutationOptions({
      onSuccess: () => {
        refetch();
        setTodo("");
      },
    }),
  );

  const submitTodo = useCallback(() => {
    addTodo({ name: todo, description: "" });
  }, [addTodo, todo]);

  return (
    <div className="min-h-screen">
      <ThemeToggle className="absolute top-4 right-4" />
      <LogoutButton className="absolute top-4 right-16" />

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-8 font-bold text-4xl tracking-tight">
          oRPC Todo List
        </h1>

        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Todo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                onChange={(e) => setTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submitTodo();
                  }
                }}
                placeholder="Enter a new todo..."
                type="text"
                value={todo}
              />
              <Button
                className="w-full"
                disabled={todo.trim().length === 0}
                onClick={submitTodo}
                type="button"
              >
                Add Todo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Todo Items</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No todos yet. Add one above to get started!
                </p>
              ) : (
                <ul className="space-y-3">
                  {data?.map((t) => (
                    <li className="rounded-lg border bg-card p-4" key={t.id}>
                      <span className="text-lg">{t.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
