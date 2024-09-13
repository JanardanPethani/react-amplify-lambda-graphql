import {
  Text,
  Flex,
  Button,
  Authenticator,
  Badge,
  View,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/api";
import { useState, useEffect } from "react";

import { helloWorldLambda, listTodos } from "./graphql/queries";
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import {
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
} from "./graphql/subscriptions";

const client = generateClient();

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const result = await client.graphql({ query: listTodos });

      // Call lambda function
      await client.graphql({
        query: helloWorldLambda,
        variables: {
          msg: "Test message!!",
        },
      });

      setTodos(result.data.listTodos.items);
    };
    fetchTodos();

    const createSub = client.graphql({ query: onCreateTodo }).subscribe({
      next: ({ data }) => {
        setTodos((todos) => [...todos, data.onCreateTodo]);
      },
    });

    const updateSub = client.graphql({ query: onUpdateTodo }).subscribe({
      next: ({ data }) => {
        setTodos((todos) => {
          const toUpdateIndex = todos.findIndex(
            (item) => item.id === data.onUpdateTodo.id
          );
          if (toUpdateIndex === -1) {
            // If the todo doesn't exist, treat it like an "add"
            return [...todos, data.onUpdateTodo];
          }
          return [
            ...todos.slice(0, toUpdateIndex),
            data.onUpdateTodo,
            ...todos.slice(toUpdateIndex + 1),
          ];
        });
      },
    });

    const deleteSub = client.graphql({ query: onDeleteTodo }).subscribe({
      next: ({ data }) => {
        setTodos((todos) => {
          const toDeleteIndex = todos.findIndex(
            (item) => item.id === data.onDeleteTodo.id
          );
          return [
            ...todos.slice(0, toDeleteIndex),
            ...todos.slice(toDeleteIndex + 1),
          ];
        });
      },
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Flex
          direction={"column"}
          maxWidth={"1000px"}
          marginLeft={"auto"}
          marginRight={"auto"}
        >
          {/* Add Todo */}
          <Flex
            direction={"column"}
            padding={8}
            width={"100%"}
            maxWidth={"100%"}
          >
            <Text>
              Logged in as <b>{user.username}</b>{" "}
              <Button variation="link" onClick={signOut}>
                Sign out
              </Button>
            </Text>
            <Button
              onClick={async () => {
                await client.graphql({
                  query: createTodo,
                  variables: {
                    input: {
                      content: window.prompt("content?"),
                    },
                  },
                });
              }}
            >
              Add todo
            </Button>
          </Flex>
          {/* List */}
          <Flex
            direction={"column"}
            width={"100%"}
            maxWidth={"100%"}
            alignItems={"center"}
          >
            {todos.map((todo) => (
              <Flex
                direction="column"
                border="1px solid black"
                borderRadius={"4px"}
                minWidth={"300px"}
                maxWidth={"400px"}
                padding={8}
                key={todo.id}
              >
                <Text fontWeight={"bold"}>{todo.content}</Text>
                <View>
                  👨‍👩‍👧‍👦{" "}
                  {todo.owners.map((id, owner) => (
                    <Badge key={id} margin={4}>
                      {owner}
                    </Badge>
                  ))}
                </View>
                <Button
                  onClick={async () => {
                    await client.graphql({
                      query: updateTodo,
                      variables: {
                        input: {
                          id: todo.id,
                          owners: [
                            ...todo.owners,
                            window.prompt("Share with whom?"),
                          ],
                        },
                      },
                    });
                  }}
                >
                  Share ➕
                </Button>
                <Button
                  onClick={async () => {
                    await client.graphql({
                      query: deleteTodo,
                      variables: {
                        input: { id: todo.id },
                      },
                    });
                  }}
                >
                  Delete
                </Button>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}
    </Authenticator>
  );
}

export default App;
