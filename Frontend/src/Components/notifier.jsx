import React from "react";
import { connect,  } from "react-redux";
import {  ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifier =  ({}) =>{
  
    return (
        <>
            <ToastContainer/>
        </>
    )
}
const mapStateToProps = state => ({
    isAuthenticated : state.auth.isAuthenticated
})
export default connect(mapStateToProps,null)(Notifier)