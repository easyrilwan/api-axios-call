import { useEffect, useState } from "react";

import apiClient, { CanceledError } from "./services/api-client";

interface User {
  id: number;
  name: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);

    /* Promise */
    apiClient
      .get<User[]>("/users", {
        signal: controller.signal,
      })
      .then((response) => {
        setUsers(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
        setIsLoading(false);
      });

    /* Not Working on StrictMode but Work in Production */
    // .finally(() => {
    //   setIsLoading(false);
    // });

    /* Async-Await */
    // const fetchUsers = async () => {
    //   try {
    //     const response = await axios.get<User[]>(
    //       "https://jsonplaceholder.typicode.com/iusers"
    //     );
    //     setUsers(response.data);
    //   } catch (error) {
    //     setError((error as AxiosError).message);
    //   }
    // };

    // fetchUsers();

    return () => controller.abort();
  }, []);

  const deleteUser = (user: User) => {
    const originalUsers = [...users];
    setUsers(users.filter((u) => u.id !== user.id));

    apiClient.delete("/users/" + user.id).catch((error) => {
      setError(error.message);
      setUsers(originalUsers);
    });
  };

  const addUser = () => {
    const originalUsers = [...users];
    const newUser = { id: 0, name: "Rilwan" };
    setUsers([newUser, ...users]);

    apiClient
      .post("/users", newUser)

      // .then((res) => setUsers([res.data, ...users]));

      /* Or For More Readable Code */
      .then(({ data: savedUser }) => setUsers([savedUser, ...users]))
      .catch((error) => {
        setError(error.message);
        setUsers(originalUsers);
      });
  };

  const updateUser = (user: User) => {
    const originalUsers = [...users];
    const updatedUser = { ...user, name: user.name + "!" };
    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));

    /* 
    PUT method is used to replace
    PATCH method is used to update
    */
    apiClient.patch("/users/" + user.id, updateUser).catch((error) => {
      setError(error.message);
      setUsers(originalUsers);
    });
  };

  return (
    <>
      {error && <p className="text-danger">{error}</p>}

      {isLoading && <div className="spinner-border"></div>}

      <button className="btn btn-primary mb-3" onClick={addUser}>
        Add
      </button>

      <ul className="list-group">
        {users.map((user) => (
          <li
            key={user.id}
            className="list-group-item d-flex justify-content-between"
          >
            {user.name}{" "}
            <div>
              <button
                className="btn btn-outline-secondary mx-1"
                onClick={() => updateUser(user)}
              >
                Update
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => deleteUser(user)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
