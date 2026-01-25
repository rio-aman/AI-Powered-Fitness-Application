import { Grid } from "@mui/material";
import { Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getActivities } from "../services/api";

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);
  return (
    <Grid container spacing={3}>
      {activities.map((activity) => (
        <Grid item xs={12} sm={6} md={4} key={activity.id}>
          <Card
            sx={{
              cursor: "pointer",
              height: "100%",
              borderRadius: 3,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => navigate(`/activities/${activity.id}`)}
          >
            <CardContent sx={{backgroundColor: '#c7f783'}}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {activity.type}
              </Typography>

              <Typography color="text.secondary">
                Duration: {activity.duration} min
              </Typography>

              <Typography color="text.secondary">
                Calories: {activity.caloriesBurned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ActivityList;
