import { LoginForm } from "@/components/loginform"
import { useEffect, useState } from "react"
import axios from 'axios'

export default function LoginPage() {
    const [message, setMessage] = useState("")

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const response = await axios.get("/api/") 
                setMessage(response.data.message)
            } catch (err) {
                console.error("Error fetching message:", err)
            }
        }

        fetchMessage()
    }, [])

    useEffect(() => {
        if (message) {
            console.log("✅ Message updated:", message);
            alert(message); 
        }
    }, [message]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm />
            </div>
        </div>
    )
}
