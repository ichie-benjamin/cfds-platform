import { useEffect, useState, useRef } from 'react';
import { Menu } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatInput } from '@/components/chat/chat-input';
import ChatMessageList from '@/components/chat/ChatMessageList';
import { useChat } from '@/hooks/useChat';
import useUserStore from '@/store/userStore';
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

/**
 * Live Chat page that provides real-time communication with support
 */
const LiveChat = () => {
    const [messageText, setMessageText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const user = useUserStore(state => state.user);

    // Hide MainLayout chrome while this page is mounted (matches security/settings pattern)
    useEffect(() => {
        document.body.classList.add("chat-active");
        return () => {
            document.body.classList.remove("chat-active");
        };
    }, []);

    const shellStyles = (
        <style>{`
            body.chat-active .fixed.top-0.left-0.right-0.z-20,
            body.chat-active .fixed.top-\\[60px\\].left-0.bottom-0 {
              display: none !important;
            }
            body.chat-active .flex.flex-1.pt-\\[90px\\] {
              padding-top: 0 !important;
            }
            body.chat-active .flex-1.md\\:ml-\\[80px\\] {
              margin-left: 0 !important;
            }
        `}</style>
    );

    // Always call useChat without parameters for regular user chat
    const {
        messages,
        isLoading,
        error,
        sendMessage,
        loadMoreMessages,
        hasMoreMessages,
        selectedFiles,
        addFile,
        removeFile,
        // isPolling
    } = useChat(); // No parameter for user chat

    const handleSendMessage = async () => {
        if (!messageText.trim() && selectedFiles.length === 0) return;

        await sendMessage(messageText);
        setMessageText('');

        // Scroll to bottom after sending
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };


    // If user is not logged in, show a message
    if (!user) {
        return (
            <>
                {shellStyles}
                <div
                    className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
                    style={{
                        background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
                        color: "#eef2f7",
                    }}
                >
                    <TickerBar />
                    <DashboardNavbar />
                    <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
                        <DashboardSidebar
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                        <main className="overflow-y-auto px-4 py-7 md:px-8" style={{ maxHeight: "100%" }}>
                            <div className="container mx-auto py-6">
                                <div className="flex flex-col h-[calc(100vh-260px)]">
                                    <div className="mb-4 flex items-center gap-3">
                                        <button
                                            onClick={() => setIsSidebarOpen(true)}
                                            aria-label="Open navigation"
                                            className="md:hidden flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
                                        >
                                            <Menu className="h-[1.05rem] w-[1.05rem]" />
                                        </button>
                                        <h1 className="font-[Outfit,sans-serif] text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">Live Chat Support</h1>
                                    </div>
                                    <Card
                                        className="flex-1 flex items-center justify-center rounded-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                                        style={{
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                                        }}
                                    >
                                        <CardContent className="text-center">
                                            <p className="text-[#8b97a8] text-[0.87rem]">
                                                Please log in to access the chat support.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {shellStyles}
            <div
                className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
                style={{
                    background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
                    color: "#eef2f7",
                }}
            >
                <TickerBar />
                <DashboardNavbar />
                <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
                    <DashboardSidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                    <main className="overflow-hidden p-4 md:p-6 flex flex-col min-h-0" style={{ maxHeight: "100%" }}>
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        aria-label="Open navigation"
                                        className="md:hidden flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
                                    >
                                        <Menu className="h-[1.05rem] w-[1.05rem]" />
                                    </button>
                                    <h1 className="font-[Outfit,sans-serif] text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">Live Chat Support</h1>
                                </div>
                                {/*<div className={`flex items-center text-sm ${status.className}`}>*/}
                                {/*    {status.icon}*/}
                                {/*    {status.text}*/}
                                {/*</div>*/}
                            </div>

                            <Card
                                className="flex flex-col flex-1 overflow-hidden min-h-0 py-0 rounded-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                                }}
                            >
                                <CardContent className="flex flex-col h-full p-0">
                                    <div className="flex-1 overflow-y-auto p-4 bg-[rgba(255,255,255,0.01)]">
                                        {error && (
                                            <div className="bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] text-[#f43f5e] text-[0.82rem] p-3 mb-4 rounded-[10px]">
                                                {error}
                                            </div>
                                        )}

                                        <ChatMessageList
                                            messages={messages}
                                            currentUserId={user.id}
                                            isLoading={isLoading}
                                            onLoadMore={loadMoreMessages}
                                            hasMoreMessages={hasMoreMessages}
                                        />

                                        <div ref={bottomRef} />
                                    </div>

                                    <div className="border-t border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-4">
                                        <ChatInput
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onSend={handleSendMessage}
                                            onFileSelect={addFile}
                                            disabled={false}
                                            selectedFiles={selectedFiles}
                                            onFileRemove={removeFile}
                                        />
                                        {/*{isPolling && (*/}
                                        {/*    <div className="text-xs text-yellow-500 mt-1">*/}
                                        {/*        Using backup connection - messages may be slightly delayed*/}
                                        {/*    </div>*/}
                                        {/*)}*/}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default LiveChat;
