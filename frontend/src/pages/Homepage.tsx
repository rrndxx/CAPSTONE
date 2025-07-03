import { cn } from "@/lib/utils"

const Homepage = () => {
  const cardSettings = "grid grid-cols-1 gap-4 h-screen"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
      <div className={cn(cardSettings)}>
        <div className="bg-primary-foreground p-4 rounded-lg lg:row-span-2">Div 1</div>
        <div className="bg-primary-foreground p-4 rounded-lg lg:row-span-6">Div 2</div>
      </div>

      <div className={cn(cardSettings, "col-span-2")}>
        <div className="bg-primary-foreground p-4 rounded-lg row-span-4">Div 3</div>
        <div className="bg-primary-foreground p-4 rounded-lg">Div 4</div>
      </div>

      <div className={cn(cardSettings)}>
        <div className="bg-primary-foreground p-4 rounded-lg row-span-2">Div 5</div>
        <div className="bg-primary-foreground p-4 rounded-lg">Div 6</div>
      </div>
    </div>
  )
}

export default Homepage
