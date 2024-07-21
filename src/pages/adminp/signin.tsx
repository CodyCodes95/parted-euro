import React from "react";
import { Button } from "../../components/ui/button";
import { signIn } from "next-auth/react";

const signin = () => {
  return (
    <Button className="text-2xl" onClick={() => signIn("google")}>
      Sign in
    </Button>
  );
};

export default signin;
