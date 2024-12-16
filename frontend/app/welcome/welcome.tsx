import { useNavigate } from "react-router";
import UUID from "short-unique-id";
const Welcome = () => {
  const navigate = useNavigate();

  const handleGenerateBoard = () => {
    const boardId = new UUID({length: 10}); // Generate a unique board ID
    
    navigate(`/board/${boardId.rnd(10)}`); // Redirect to the board page
  };

  return (

        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to PasteSync</h1>
        <button 
          className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleGenerateBoard}
        >
          Generate Board
        </button>
      </div>

  );
};
export default Welcome;