import React, { useState } from "react";
import {
  Redirect,
    useLocation
  } from "react-router-dom";
import {API_URL} from "./constants"

const Callback = () => {

    const [url,setUrl] = useState();

    function useQuery() {
        return new URLSearchParams(useLocation().search);
      }
      let query = useQuery();

    const sendVerifier = (oauth_verifier,oauth_token) => {
        fetch(`${API_URL}/callback?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`, {
          method: "GET",
          mode:"cors",
          credentials:"include"
        })
        .then(res=>res.json())
        .then(response => {
          console.log(response);
          if(response.data && response.keys){
            //window.location.href = "http://localhost:3000/app"
            setUrl("/app")
          }
        })
    }
    React.useEffect(() => {
        sendVerifier(query.get("oauth_verifier"), query.get("oauth_token"))
    },[])
    return (
        <div style={{height:"100vh", display:"flex", justifyContent:"center",alignItems:"center",textAlign:"center", fontSize:"32px"}}>
            Please wait while we authenticate you, you will be redirected automatically.....
            {
              url && <Redirect to={url}/>
            }
        </div>
    )
}

export default Callback;