import { Testing } from "./deps.ts";
const { assertObjectMatch } = Testing;

import { createUserData } from "./createUser.ts";

Deno.test("createUserData", (): void => {
  const formData = "username=test&password=passTest";
  const expected = {
    username: "test",
    password: "passTest",
    is_admin: false,
  };
  const userData = createUserData(formData);

  assertObjectMatch(userData, expected);
});
