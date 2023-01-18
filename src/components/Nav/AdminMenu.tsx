import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";
import { useEffect, useRef } from "react";

interface AdminPopupProps {
  open: boolean;
  setOpen: any;
}

const AdminPopup: React.FC<AdminPopupProps> = ({open, setOpen}) => {

  const popUpRef = useRef<HTMLDivElement>(null);
  
 const closePopup = (e: any) => {
   if (popUpRef.current && open && !popUpRef.current.contains(e.target)) {
     setOpen(false);
   }
 };
  
  useEffect(() => {
    document.addEventListener("mousedown", closePopup);
  }, [])



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


  return (
    <Stack
      ref={popUpRef}
      className={`absolute top-[4rem] right-6 z-[100] ${
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

export default AdminPopup
