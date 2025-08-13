import React from "react";
import { Avatar, Badge, Box, Stack, Tooltip } from "@mui/material";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

interface Props {
  clients: Patient[];
}

const ClientsRibbon: React.FC<Props> = ({ clients }) => {
  return (
    <Box sx={{ overflowX: "auto" }} pb={1}>
      <Stack direction="row" spacing={2}>
        {clients.map((c) => (
          <Tooltip key={c.id} title={`${c.first_name} ${c.last_name}`} arrow>
            <Badge
              overlap="circular"
              badgeContent=" "
              variant="dot"
              color="success"
              invisible={Math.random() > 0.2} // 20 % online – replace with real data
            >
              <Avatar
                sx={{ width: 56, height: 56 }}
                src={
                  c.profile_picture
                    ? `https://hazalkaynak.pythonanywhere.com/${c.profile_picture}`
                    : undefined
                }
              >
                {!c.profile_picture &&
                  `${c.first_name.charAt(0)}${c.last_name.charAt(0)}`}
              </Avatar>
            </Badge>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
};

export default ClientsRibbon;
