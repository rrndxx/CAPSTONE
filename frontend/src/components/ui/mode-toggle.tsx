import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/provider/ThemeProvider"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="flex items-center gap-2">
      <span>{isDark ? <Moon /> : <Sun />}</span>
      <Switch checked={isDark} onCheckedChange={toggleTheme} />
    </div>
  )
}
