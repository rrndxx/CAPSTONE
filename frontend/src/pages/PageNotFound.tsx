import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FileWarning } from "lucide-react"

const NotFound = () => {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4 text-foreground">
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-muted/60 backdrop-blur-md p-10 rounded-xl shadow-xl w-full max-w-md text-center"
                aria-labelledby="error-heading"
                role="alert"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex flex-col items-center gap-4"
                >
                    <FileWarning className="h-12 w-12 text-chart-2" />
                    <h1 id="error-heading" className="text-5xl font-extrabold text-chart-2">
                        404
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground">
                        Sorry, the page you're looking for was not found.
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-6 inline-block rounded-md bg-chart-2 px-6 py-3 text-white text-sm font-medium transition-colors hover:bg-chart-2/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                    >
                        Go back home
                    </Link>
                </motion.div>
            </motion.section>
        </main>
    )
}

export default NotFound
