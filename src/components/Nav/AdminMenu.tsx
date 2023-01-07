import * as React from "react";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";

export default function AdminMenu({open, setOpen}:any) {
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen:any) => !prevOpen);
  };

  const handleCloseLogout = (event: Event | React.SyntheticEvent) => {
    window.location.href = "/api/auth/logout";
    setOpen(false);
  };

  const handleCloseAdmin = (event: Event | React.SyntheticEvent) => {
    window.location.href = "/admin";
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <Stack
      className={`absolute top-[4rem] right-6 ${
        open ? "visible" : "invisible"
      }`}
      direction="row"
      spacing={2}
    >
      <Paper>
        <MenuList>
          <MenuItem onClick={handleCloseAdmin}>Admin</MenuItem>
          <MenuItem onClick={handleCloseLogout}>Logout</MenuItem>
        </MenuList>
      </Paper>
    </Stack>
  );
}
