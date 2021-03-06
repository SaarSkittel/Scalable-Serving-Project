import React, { useState, useContext } from "react";
import History from "../History";
import { Redirect } from "react-router-dom";

import {
  Button,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import Auth from "../Functions/Auth";
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}
const useStyle = makeStyles((theme) => ({
  paper: {
    padding: "30px 20px",
    width: 300,
    margin: "20px auto",
  },
  header: {
    marginBottom: "30px",
  },
  text_fields: {
    marginBottom: "20px",
  },
}));
const LoginPage = (props) => {
  const { setAccessToken, setLogin, updateAccessToken } = useContext(Auth);
  const forceUpdate = useForceUpdate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const classes = useStyle();
  if (props.isLoggedIn) {
    History.replace("/");
  } else {
    return (
      <Grid>
        <Paper className={classes.paper} elevation={20}>
          <Grid direction={"column"} spacing={24}>
            <Typography variant="h2" className={classes.header}>
              Login
            </Typography>
            <Grid>
              <TextField
                className={classes.text_fields}
                label="User Name"
                variant="filled"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <TextField
                className={classes.text_fields}
                label="Password"
                variant="filled"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="Login"
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!userName || !password) {
                    setError("Missing user name or/and password.");
                  } else {
                    //CREATE A REQUEST TO SERVER FOR LOGIN
                    const data = {
                      userName: userName,
                      password: password,
                    };
                    //POST REQUEST W/ DATA
                    const requestOptions = {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    };
                    fetch("http://localhost:8002/login", requestOptions)
                      .then((response) => {
                        if (response.status === 200) {
                          console.log(response);
                          updateAccessToken();
                          forceUpdate();
                        } else {
                          setError("Incorrect username or password.");
                        }
                      })
                      /*
                    .then((response) => {
                        let data =response.json(); 
                        console.log(data);
                        if(response.status===200){
                          console.log(JSON.stringify(data.AccessToken));
                          setLogin(true);
                          setAccessToken(data.AccessToken);
                          
                        }
                        else{
                          setError("Incorrect username or password.");
                        }
                      })*/
                      .catch((err) => {
                        console.log(err);
                      });
                  }
                }}
              >
                Log in
              </Button>
            </Grid>
            <Typography variant="h6" className={classes.header} color="error">
              {error}
            </Typography>
          </Grid>
        </Paper>
      </Grid>
    );
  }
};
export default LoginPage;
