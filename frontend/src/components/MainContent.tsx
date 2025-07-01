const MainContent = () => {
  return (
    <main className="flex flex-col md:flex-row h-screen w-full bg-amber-200">
      {/* Sidebar Card Section */}
      <div className="bg-white w-full md:w-1/4 h-1/2 md:h-full flex flex-col items-center p-4 gap-4">
        <h1 className="text-2xl font-semibold mt-4 text-center text-black">Good day, Admin!</h1>

        {/* Mini Cards with Gap */}
        <div className="bg-black w-full max-w-[300px] rounded-lg flex flex-col gap-4 p-4">
          <section className="bg-black text-white h-8 w-full text-center flex items-center justify-center rounded-md shadow">
            Card 1
          </section>
          <section className="bg-black text-white h-8 w-full text-center flex items-center justify-center rounded-md shadow">
            Card 2
          </section>
        </div>

        {/* Expandable Section */}
        <div className="w-full max-w-[300px] h-full bg-green-200 rounded-lg flex items-center justify-center text-center">
          Another div auto
        </div>
      </div>

      {/* Right Side Content */}
      <div className="w-full md:w-3/4 h-1/2 md:h-full flex items-center justify-center">
        wows
      </div>
    </main>
  );
};

export default MainContent;
