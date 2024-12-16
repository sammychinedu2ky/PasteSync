import { useNavigation, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { RealTimeBoard } from "~/RealTimeBoard/realTimeBoard";
import { toast, ToastContainer } from "react-toastify";     // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";


type LoaderData = {
  boardData: any;
  boardId: string;
};
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Real Time text Board" },
    { name: "description", content: "Real time text board" },
  ];
}

const fetchBoardData = async (boardId: string) => {
  try {
    const response = await fetch(`/api/board/${boardId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch board data");
    }
    return response.text();
  } catch (error) {
    console.error("Error fetching board data:", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    return null;
  }
};

export async function clientLoader({ params }: Route.LoaderArgs) {
  let boardId = params.id;
  if (!boardId) {
    return redirect("/404");
  }
  let boardData = await fetchBoardData(boardId);
  // if (!boardData) {
  //  // toast.error("Failed to fetch board data.");
  //   return redirect("/404");
  // }
  return { boardData, boardId };
}

// export function HydrateFallback() {
//   return <p>Loading Board</p>;
// }

export default function BoardRoute() {
  const loaderData = useLoaderData<LoaderData>();
  
  useEffect(() => {
    if (!loaderData.boardData) {
      toast.error("Failed to fetch board data.");
    }
  }, [loaderData.boardData]);

  const { boardData, boardId } = loaderData;
  return (
    <>
      <RealTimeBoard boardData={boardData} boardId={boardId} />
    </>);
}