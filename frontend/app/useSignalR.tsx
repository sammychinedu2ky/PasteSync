import { useState, useEffect } from "react";
import { HubConnectionBuilder, HubConnection, HubConnectionState, } from "@microsoft/signalr";
import * as signalR from '@microsoft/signalr';

// Custom hook for SignalR
export function useSignalR(boardId: string) {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [boardContent, setBoardContent] = useState<string>("");
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5295/api/pastesync",
                {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets,
                withCredentials: false,             }
            )
            .withAutomaticReconnect()
            // .configureLogging(signalR.LogLevel.Trace)
            .build();

        newConnection
            .start()
            .then(() => {
                console.log("Connected to SignalR hub");
                if (newConnection.state === HubConnectionState.Connected) {
                    setConnection(newConnection);
                    console.log("Joining boarssssssssssssssd:", boardId);
                    newConnection.invoke("JoinBoard", boardId);
                }
            })
            .catch((err) => {
                console.log("Error connecting to SignalR hub:", err);
            });


        newConnection.on("ReceiveText", (content: string) => {
            setBoardContent(content); 
        });

        return () => {
            if (newConnection.state === HubConnectionState.Connected) {
                newConnection.stop();
            }
        };
    }, []);

    // Function to update board content
    const updateBoard = async (content: string) => {
        if (connection?.state === HubConnectionState.Connected) {
            try {
                await connection.invoke("UpdateBoard", boardId, content);
                console.log("Board content updated");
            } catch (error) {
                console.error("Error updating board:", error);
            }
        }
    };

    return { boardContent, setBoardContent, updateBoard };
}
