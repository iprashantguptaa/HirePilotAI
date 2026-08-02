import { Link } from "react-router"
import { Button } from "../components/ui"
import "./NotFound.scss"

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                {/* Animated 404 */}
                <div className="not-found-number">
                    <span className="not-found-number__digit">4</span>
                    <span className="not-found-number__digit not-found-number__digit--pulse">0</span>
                    <span className="not-found-number__digit">4</span>
                </div>

                {/* Icon */}
                <div className="not-found-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>

                {/* Text Content */}
                <h1>Page Not Found</h1>
                <p>The page you're looking for doesn't exist or has been moved.</p>

                {/* Actions */}
                <div className="not-found-actions">
                    <Link to="/">
                        <Button variant="primary" size="lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Go Home
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button variant="secondary" size="lg">
                            View History
                        </Button>
                    </Link>
                </div>

                {/* Help Text */}
                <div className="not-found-help">
                    <p>Need help? <Link to="/feedback" className="not-found-link">Contact support</Link></p>
                </div>
            </div>
        </div>
    )
}

export default NotFound
