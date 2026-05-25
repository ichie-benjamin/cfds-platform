import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, Menu, X } from "lucide-react";
import useOnlineStatusStore from "@/store/OnlineStatusState";
import useUserStore from "@/store/userStore";
import axiosInstance from "@/lib/axios";
import { useChat } from "@/hooks/useChat";
import ChatMessageList from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/chat-input";
import { UserList } from "./UserList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    account_id: string;
    last_activity?: string;
    is_online: boolean;
    unread_count?: number;
}

export default function AdminChat() {
    // State for users and selection
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<"all" | "online" | "unread">("all");
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messageText, setMessageText] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [usersFetchError, setUsersFetchError] = useState<string | null>(null);

    // Current admin user
    const currentUser = useUserStore((state) => state.user);

    const startHeartbeat = useOnlineStatusStore(state => state.startHeartbeat);

    console.log(usersFetchError);

    // Chat functionality using the updated hook
    // Fix: Always pass a stable value to useChat
    const selectedUserId = selectedUser?.id || "";
    const {
        messages,
        sendMessage,
        isLoading: chatLoading,
        error: chatError,
        loadMoreMessages,
        hasMoreMessages,
        connectionStatus,
        selectedFiles,
        addFile,
        removeFile,
        isPolling
    } = useChat(selectedUserId);

    // Start heartbeat to track online users
    useEffect(() => {
        startHeartbeat();
    }, [startHeartbeat]);

    // Fetch users with enhanced error handling
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get("/admin/users");
                if (response.data && Array.isArray(response.data.data)) {
                    const newUsers = response.data.data;
                    setUsers(newUsers);
                    setUsersFetchError(null);

                    // Update selected user if it exists in the new data
                    setSelectedUser(prevSelected => {
                        if (prevSelected) {
                            const updatedSelectedUser = newUsers.find((u: { id: string; }) => u.id === prevSelected.id);
                            return updatedSelectedUser || prevSelected;
                        }
                        return prevSelected;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setUsersFetchError("Failed to load users. Retrying...");
            } finally {
                if (isInitialLoading) {
                    setIsInitialLoading(false);
                }
            }
        };

        fetchUsers();

        const intervalId = setInterval(fetchUsers, 30000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!messageText.trim() && selectedFiles.length === 0) return;
        if (!selectedUser) return;

        try {
            await sendMessage(messageText);
            setMessageText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // Handle user selection
    const handleUserSelect = (user: ChatUser) => {
        setSelectedUser(user);
        // Close mobile menu when user is selected
        setIsMobileMenuOpen(false);
        // Clear message text when switching users
        setMessageText("");
    };

    // Get connection status display
    const getConnectionStatus = () => {
        if (connectionStatus === 'connected') {
            return {
                text: 'Connected',
                className: 'text-[#00dfa2]',
                icon: <span className="w-2 h-2 bg-[#00dfa2] rounded-full inline-block mr-2 shadow-[0_0_8px_rgba(0,223,162,0.6)]" />
            };
        } else if (isPolling) {
            return {
                text: 'Reconnecting...',
                className: 'text-[#F0B429]',
                icon: <span className="w-2 h-2 bg-[#F0B429] rounded-full inline-block mr-2 animate-pulse" />
            };
        } else {
            return {
                text: 'Disconnected',
                className: 'text-[#f43f5e]',
                icon: <span className="w-2 h-2 bg-[#f43f5e] rounded-full inline-block mr-2" />
            };
        }
    };

    const status = getConnectionStatus();

    return (
        <div
            className="h-screen flex flex-col text-[#eef2f7] font-[Inter,-apple-system,sans-serif]"
            style={{
                background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
            }}
        >
            {/* Admin Chat Header (mobile) */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[rgba(7,8,12,0.75)] backdrop-blur p-4 lg:hidden">
                <h1 className="font-[Outfit,sans-serif] text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">Admin Chat</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden h-9 w-9 rounded-[10px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] text-[#8b97a8] hover:text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)]"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* User List - Sidebar */}
                <div className={cn(
                    "fixed lg:relative inset-y-0 left-0 z-50 w-80 border-r border-white/[0.06] transform transition-transform duration-300 ease-in-out lg:transform-none",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <UserList
                        users={users}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        selectedUser={selectedUser}
                        setSelectedUser={handleUserSelect}
                        isInitialLoading={isInitialLoading}
                    />
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div
                                className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                                }}
                            >
                                <div className="flex items-center min-w-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden mr-2 flex-shrink-0 h-9 w-9 rounded-[10px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] text-[#8b97a8] hover:text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)]"
                                        onClick={() => setIsMobileMenuOpen(true)}
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-10 w-10 mr-3 border border-white/[0.06]">
                                            <AvatarImage src={selectedUser.avatar} alt={`${selectedUser.first_name} ${selectedUser.last_name}`} />
                                            <AvatarFallback className="bg-[rgba(0,223,162,0.1)] text-[#00dfa2] text-[0.78rem] font-bold">
                                                {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {selectedUser.is_online && (
                                            <div className="absolute bottom-0 right-3 h-3 w-3 rounded-full bg-[#00dfa2] border-2 border-[#0a0d15] shadow-[0_0_8px_rgba(0,223,162,0.6)]"></div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[0.95rem] font-extrabold text-[#eef2f7] truncate">
                                            {selectedUser.first_name} {selectedUser.last_name}
                                        </div>
                                        <div className="text-[0.75rem] text-[#8b97a8] flex items-center gap-1.5">
                                            {selectedUser.is_online ? (
                                                <>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#00dfa2]" />
                                                    Online
                                                </>
                                            ) : (
                                                <>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#4a5468]" />
                                                    Offline
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`hidden sm:flex items-center text-[0.72rem] font-bold ${status.className}`}>
                                        {status.icon}
                                        {status.text}
                                    </div>
                                    <div className="hidden sm:block text-[0.72rem] text-[#4a5468] font-mono flex-shrink-0">
                                        ID: {selectedUser.account_id}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-[rgba(255,255,255,0.01)]">
                                {chatLoading && messages.length === 0 ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-6 w-6 animate-spin text-[#00dfa2]" />
                                    </div>
                                ) : (
                                    <ChatMessageList
                                        messages={messages}
                                        currentUserId={currentUser?.id || ""}
                                        isLoading={chatLoading}
                                        onLoadMore={loadMoreMessages}
                                        hasMoreMessages={hasMoreMessages}
                                    />
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="border-t border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-4">
                                <ChatInput
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onSend={handleSendMessage}
                                    disabled={false}
                                    onFileSelect={addFile}
                                    selectedFiles={selectedFiles}
                                    onFileRemove={removeFile}
                                />
                                {isPolling && (
                                    <div className="text-[0.72rem] text-[#F0B429] mt-2">
                                        Using backup connection - messages may be slightly delayed
                                    </div>
                                )}
                                {chatError && (
                                    <div className="mt-2 text-[0.72rem] text-[#f43f5e] bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] rounded-[8px] px-3 py-2">
                                        {chatError}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // No user selected placeholder
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,223,162,0.1)]">
                                <MessageCircle className="h-7 w-7 text-[#00dfa2]" />
                            </div>
                            <h3 className="font-[Outfit,sans-serif] text-[1.45rem] font-extrabold tracking-[-0.02em] text-[#eef2f7] mb-2">
                                Select a user to start chatting
                            </h3>
                            <p className="text-[0.87rem] text-[#8b97a8] max-w-md leading-relaxed">
                                Choose a user from the list to view their conversation and send messages.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-5 lg:hidden bg-[rgba(255,255,255,0.02)] border-white/[0.08] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)] rounded-xl"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                Show Users
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
