import Sidebar from "./components/Sidebar"
import MainContent from "./components/MainContent"

const App = () => {
  return (
    <div className="flex flex-col md:flex-row flex-2/12">
      <Sidebar />
      <MainContent />      
    </div>
  )
}

export default App