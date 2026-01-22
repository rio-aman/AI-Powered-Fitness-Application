import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { addActivity } from "../services/api";

const ActivityForm = ({ onActivityAdded }) => {
  const [activity, setActivity] = useState({
    type: "",
    duration: "",
    caloriesBurned: "",
    additionalMetrics: {},
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addActivity({
        ...activity,
        duration: Number(activity.duration),
        caloriesBurned: Number(activity.caloriesBurned),
      });

      onActivityAdded();

      // Reset form
      setActivity({
        type: "",
        duration: "",
        caloriesBurned: "",
        additionalMetrics: {},
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel id="activity-type-label">
          Activity Type
        </InputLabel>
        <Select
          labelId="activity-type-label"
          id="activity-type"
          label="Activity Type"
          value={activity.type}
          onChange={(e) =>
            setActivity({ ...activity, type: e.target.value })
          }
        >
          <MenuItem value="RUNNING">Running</MenuItem>
          <MenuItem value="WALKING">Walking</MenuItem>
          <MenuItem value="CYCLING">Cycling</MenuItem>
          <MenuItem value="SWIMMING">Swimming</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        required
        label="Duration (Minutes)"
        type="number"
        sx={{ mb: 2 }}
        value={activity.duration}
        onChange={(e) =>
          setActivity({ ...activity, duration: e.target.value })
        }
      />

      <TextField
        fullWidth
        required
        label="Calories Burned"
        type="number"
        sx={{ mb: 2 }}
        value={activity.caloriesBurned}
        onChange={(e) =>
          setActivity({ ...activity, caloriesBurned: e.target.value })
        }
      />

      <Button type="submit" variant="contained" fullWidth 
        sx={{
          borderRadius: 3,
          fontWeight: 600,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 14px 35px rgba(0,0,0,0.25)",
          },
        }}>
        Add Activity
      </Button>
    </Box>
  );
};

export default ActivityForm;
