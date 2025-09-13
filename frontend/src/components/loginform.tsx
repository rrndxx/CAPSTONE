import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import axios from "axios"
import { fetchDevices } from "@/hooks/useDevices"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const loginUser = async (credentials: { email: string; password: string }) => {
        const res = await axios.post("http://localhost:4000/auth/login", credentials)
        return res.data
    }

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: async (data) => {
            // Save token
            localStorage.setItem("token", data.token)

            // Prefetch devices into React Query cache
            await queryClient.prefetchQuery({
                queryKey: ["devices", data.interfaceId], // assuming backend provides this
                queryFn: () => fetchDevices(data.interfaceId),
            })

            // Redirect to dashboard
            navigate("/dashboard")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate({ email, password })
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center mb-7">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-balance">
                                    Login to your Netdetect account
                                </p>
                            </div>

                            {/* Email */}
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="netdetect@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div className="grid">
                                <div className="grid gap-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3 text-right text-xs">
                                    <a href="#" className="underline-offset-2 hover:underline">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                    </form>

                    {/* Side image */}
                    <div className="relative hidden md:block">
                        <img
                            src="../../man.svg"
                            alt="image"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
