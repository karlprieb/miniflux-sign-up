import { AUTH_KEY, MINIFLUX_HOST } from "./env.ts";

type userData = {
  is_admin: boolean;
  username: string;
  password: string;
};

type minifluxSuccessResponse = {
  id: number;
  username: string;
  is_admin: boolean;
  theme: string;
  language: string;
  timezone: string;
  entry_sorting_direction: string;
  entries_per_page: number;
  keyboard_shortcuts: boolean;
  show_reading_time: boolean;
  extra: any;
  entry_swipe: boolean;
};

type minifluxErrorResponse = {
  error_message: string;
};

export const createUserData = (formData: string): userData => {
  return formData.split("&").reduce((acc, data) => ({
    ...acc,
    [data.split("=")[0]]: data.split("=")[1],
  }), { is_admin: false } as userData);
};

export const createUser = (
  formData: string,
): Promise<minifluxSuccessResponse | minifluxErrorResponse> => {
  const userData = createUserData(formData);

  const create = fetch(`${MINIFLUX_HOST}/v1/users`, {
    method: "POST",
    headers: { "X-Auth-Token": String(AUTH_KEY) },
    body: JSON.stringify(userData),
  });

  return create.then((response) => {
    return response.json();
  }).then((jsonData) => {
    return jsonData;
  });
};
