import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import UserTable from "../Components/UserTable";
import History from "../History";
const useStyle = makeStyles((theme) => {});

const HomePage = (props) => {
  const classes = useStyle();
  const [nameData, setNameData] = useState();
  const [tableData, setTableData] = useState([]);

  const [userData, setUserData] = useState([]);


  const requestOptionsGet = {
    method: "GET",
    credentials: "include",
  };
  
  const requestOptionsPost = {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
  };

  useEffect(() => {
    fetch("http://localhost:8002/", requestOptionsGet)
      .then((response) => response.json())
      .then((data) => {
        setNameData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8002/users", requestOptionsPost)
      .then((response) => response.json())
      .then((data) => {
        setTableData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);


  return (
    <div>
      <Typography> {!nameData ? "Loading..." : nameData} </Typography>
      {!props.isLoggedIn? <Typography>Not logged in</Typography>:<UserTable userList= {tableData}/>}
    </div>
  );
};
export default HomePage;