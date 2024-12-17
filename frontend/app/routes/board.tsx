import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { RealTimeBoard } from "~/RealTimeBoard/realTimeBoard";
import "react-toastify/dist/ReactToastify.css";


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

  return { boardData, boardId };
}


export default function BoardRoute() {
  const loaderData = useLoaderData<LoaderData>();



  const { boardData, boardId } = loaderData;
  return (
    <>
      <RealTimeBoard boardData={boardData} boardId={boardId} />
    </>);
}