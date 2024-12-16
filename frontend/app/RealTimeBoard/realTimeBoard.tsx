import { useState, useEffect, useRef } from "react";
import { useSignalR } from "~/useSignalR"; // Custom SignalR hook
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "use-debounce";
import MonacoEditor, { type OnChange } from "@monaco-editor/react";
import { FaClipboard } from "react-icons/fa";
import { Link } from "react-router";

export function RealTimeBoard({ boardData, boardId }: { boardData: any; boardId: string }) {
    const { boardContent, setBoardContent, updateBoard } = useSignalR(boardId);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [debouncedBoardContent] = useDebounce(null, 500);
    const [isTyping, setIsTyping] = useState(false);
    const editorRef = useRef<any>(null);
    useEffect(() => {
        if (boardData.content && boardData.content.length > 0) {
            setBoardContent(boardData.content);
        }
    }, []);

    useEffect(() => {
        console.log('Debounced Content:', debouncedBoardContent);
        if (isTyping) {
            updateBoard(boardContent);
        }
        setIsTyping(false);
    }, [debouncedBoardContent, updateBoard]);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;

        if (!editor.getValue()) {
            editor.setValue(boardContent);
        }
    };

    const handleChange: OnChange = (value) => {
        setIsTyping(true);
        if (value !== boardContent) {
            setBoardContent(value || "");
        }
    };

    const saveBoard = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/board/${boardId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(boardContent),
            });

            if (response.ok) {
                toast.success("Board saved successfully!");
                setLastSaved(new Date().toLocaleTimeString());
            } else {
                toast.error("Failed to save the board.");
            }
        } catch (error) {
            toast.error("Failed to save the board.");
        } finally {
            setSaving(false);
        }
    };

        // Function to copy content to clipboard
        const handleCopyClick = () => {
            if (editorRef.current) {
                const editorValue = editorRef.current.getValue();
                navigator.clipboard.writeText(editorValue).then(
                    () => toast.success("Content copied to clipboard!"),
                    (error) => toast.error("Failed to copy content.")
                );
            }
        };
    

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 h-screen">
                       <Link to="/" className="text-3xl font-bold mb-4 text-blue-600 hover:underline">
                PasteSync
            </Link>

            <div className="w-3/4 h-64 border border-gray-300 rounded-lg shadow-sm relative">
                <MonacoEditor
                    height="100%"
                    defaultLanguage="plaintext"
                    theme="vs-dark"
                    value={boardContent} // Bind value directly to the boardContent state
                    onMount={handleEditorDidMount}
                    onChange={handleChange} // Update local state when editor content changes
                    options={{
                        minimap: { enabled: false },
                        wordWrap: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        fontSize: 16
                    }}
                />
                <button
                    onClick={handleCopyClick}
                    className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                    aria-label="Copy content"
                >
                    <FaClipboard size={20} />
                </button>

            </div>
            <div className="flex items-center justify-between w-3/4 mt-4">
                <button
                    onClick={saveBoard}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </button>
                {lastSaved && <span className="text-sm text-gray-500">Last saved at {lastSaved}</span>}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
