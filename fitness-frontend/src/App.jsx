import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router";
import { setCredentials } from "./store/authSlice";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import ActivityDetail from "./components/ActivityDetail";
import fitai from "./assets/fitai.png"

const ActvitiesPage = () => {
  
  return (
    <Box sx={{ p: 2 }}>
      <ActivityForm onActivityAdded={() => window.location.reload()} />
      <ActivityList />
    </Box>
  );
};

/* ---------------- App ---------------- */
function App() {
  const { token, tokenData, logIn, logOut, isAuthenticated } =
    useContext(AuthContext);

  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (token && tokenData) {
      dispatch(setCredentials({ token, user: tokenData }));
      setAuthReady(true);
    }
  }, [token, tokenData, dispatch]);

  if (!authReady && isAuthenticated) {
    return <Typography sx={{ p: 4 }}>Loading...</Typography>;
  }

  return (
    <Router>
      {!token ? (
      <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <img src={fitai} alt="FitAI Logo" style={{ height: 300 }}/>
      <Typography variant="h4" gutterBottom>
        <b>Welcome to the Fitness Tracker App</b>
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Please login to access your activities
      </Typography>
      <Button variant="contained" color="primary" size="large" onClick={() => {
                logIn();
              }}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 35px rgba(0,0,0,0.25)",
                },
              }}>
        LOGIN
      </Button>
    </Box>
            ) : (
              // <div>
              //   <pre>{JSON.stringify(tokenData, null, 2)}</pre>
              //   <pre>{JSON.stringify(token, null, 2)}</pre>
              // </div>

             

              <Box sx={{ p: 2, border: '2px dashed blue' }}>
                 <AppBar position="static" color="transparent" elevation={0}>
                  <Toolbar>
                    <Box
                      component="img"
                      src={fitai}   // 👈 put your logo here
                      alt="FitAI Logo"
                      sx={{
                        height: 70,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        window.location.href = "/activities";
                      }}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={logOut}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 14px 35px rgba(0,0,0,0.25)",
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </Toolbar>
                </AppBar>
              <Routes>
                <Route path="/activities" element={<ActvitiesPage />}/>
                <Route path="/activities/:id" element={<ActivityDetail />}/>

                <Route path="/" element={token ? <Navigate to="/activities" replace/> : <div>Welcome! Please Login.</div>} />
              </Routes>
            </Box>
            )}
    </Router>
  )
}

export default App