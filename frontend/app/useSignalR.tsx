import { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HubConnection, HubConnectionState } from "@microsoft/signalr";
import * as signalR from '@microsoft/signalr';

export function useSignalR(boardId: string) {
    const connectionRef = useRef<HubConnection | null>(null);
    const [boardContent, setBoardContent] = useState<string>("");

    useEffect(() => {
        if (connectionRef.current) {
            return; 
        }

        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5295/api/pastesync", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                withCredentials: false,
            })
            .withAutomaticReconnect()
            .build();

        newConnection
            .start()
            .then(() => {
                if (newConnection.state === HubConnectionState.Connected) {
                    connectionRef.current = newConnection; // Persist the connection in ref
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

    const updateBoard = async (content: string) => {
        if (connectionRef.current?.state === HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke("UpdateBoard", boardId, content);
            } catch (error) {
                console.error("Error updating board:", error);
            }
        }
    };

    return { boardContent, setBoardContent, updateBoard };
}
