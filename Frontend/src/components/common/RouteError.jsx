import { Link, useRouteError } from "react-router"
import { Button } from "../ui"

const RouteError = () => {
    const error = useRouteError()
    const message = error?.statusText || error?.message || "Something unexpected happened."

    return (
        <main className="route-guard" role="alert">
            <h1>This page hit a snag</h1>
            <p className="route-guard__text">{message}</p>
            <Button as={Link} to="/" variant="primary">Go home</Button>
        </main>
    )
}

export default RouteError
