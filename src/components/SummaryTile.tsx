import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SummaryTile: React.FC<Props> = ({ icon, label, value }) => (
  <Card>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        {icon}
        <Stack>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {value}
          </Typography>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default SummaryTile;
