import { Button } from "antd";
import React from "react";
import s from "./AuthPage.module.css";
import {API_URL} from "./constants"

const Auth = () => {
    const authenticate = () => {
        fetch(`${API_URL}/init`, {
          method: "GET",
          redirect:"follow",
          mode:"cors",
          credentials:"include"
        })
        .then(res=>res.json())
          .then(
            response => {
              console.log(response)
              console.log(JSON.stringify(response))
              if (response) {
                window.location.href = response.redirectUrl;
              }
            }
          )
          .catch(
            err => {
              console.log(err)
            }
          )
      }


    return (
        <div className={s.wrapper}>
            <h1 data-shadow='tweedle!' className={s.title}>Tweedle!</h1>
            <br/>
            <Button type="dashed" style={{fontSize:"32px", height:"64px"}} className={s.centerButton} onClick={() => authenticate()}>
                Enter
            </Button>
            <span className={s.creditText}>
                Made for <i  class="fab fa-twitter"></i> Codechella with <span style={{color:"#E90606"}}><i class="fa fa-heart pulse"></i></span> by Daipayan, Abhigyan and Arnab
            </span>
        </div>
    )
}

export default Auth;