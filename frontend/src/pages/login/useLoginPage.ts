import { type LoginFormValues } from "./schema";

export const useLoginPage = () => {
  const onSubmit = (data: LoginFormValues) => {
    console.log(data);
  };

  return {
    onSubmit,
  };
};
