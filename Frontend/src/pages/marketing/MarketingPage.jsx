import { Link } from "react-router"
import { SEO } from "../../components/common"
import { useAuth } from "../../features/auth/hooks/useAuth.js"
import { MARKETING_PAGES } from "./content"
import "./MarketingPage.scss"

const MarketingPage = ({ slug }) => {
    const page = MARKETING_PAGES[ slug ]
    const { user } = useAuth()

    if (!page) {
        return (
            <div className="marketing-page container">
                <h1>Page not found</h1>
                <p>This page does not exist.</p>
                <Link to="/">Back to home</Link>
            </div>
        )
    }

    return (
        <>
            <SEO title={page.title} description={page.description} />
            <article className="marketing-page container">
                <header className="marketing-page__header">
                    {page.eyebrow && <span className="marketing-page__eyebrow">{page.eyebrow}</span>}
                    <h1>{page.title}</h1>
                    <p className="marketing-page__lede">{page.description}</p>
                </header>

                <div className="marketing-page__sections">
                    {page.sections?.map((section) => (
                        <section key={section.heading} className="marketing-page__section">
                            <h2>{section.heading}</h2>
                            <p>{section.body}</p>
                        </section>
                    ))}
                </div>

                <footer className="marketing-page__cta">
                    <Link
                        to={user ? "/interview/new" : "/register"}
                        className="button primary-button"
                    >
                        {user ? "Start a new analysis" : "Create free account"}
                    </Link>
                    <Link to="/contact" className="button secondary-button">Contact us</Link>
                </footer>
            </article>
        </>
    )
}

export default MarketingPage
