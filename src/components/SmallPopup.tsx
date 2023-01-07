import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useState } from "react";

interface PopupProps {
  message: string;
}

const SmallPopup: React.FC<PopupProps> = ({ message }) => {

    const [open, setOpen] = useState(false);

  return (
    <Popover
    //   id={id}
      open={open}
    //   anchorEl={anchorEl}
    //   onClose={handleClose}
    //   anchorOrigin={{
    //     vertical: "bottom",
    //     horizontal: "left",
    //   }}
    >
          <Typography sx={{ p: 2 }}>{message}</Typography>
    </Popover>
  );
};

export default SmallPopup;
