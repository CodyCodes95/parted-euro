import React from "react";
import { Button } from "../../components/ui/button";

const signin = () => {
  return (
    <Button className="text-2xl" onClick={() => signIn("google")}>
      Sign in
    </Button>
  );
};

export default signin;
