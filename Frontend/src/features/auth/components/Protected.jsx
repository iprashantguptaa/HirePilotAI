import { useAuth } from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router";
import React from 'react'

const Protected = ({children}) => {
    const { loading,user } = useAuth()
    const location = useLocation()


    if(loading){
        return (
            <main className="route-guard" aria-busy="true">
                <div className="route-guard__spinner" aria-hidden="true" />
                <p className="route-guard__text">Checking your session…</p>
            </main>
        )
    }

    if(!user){
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }
    
    return children
}

export default Protected
