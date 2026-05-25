import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface UserListProps {
    users: ChatUser[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedTab: "all" | "online" | "unread";
    setSelectedTab: (tab: "all" | "online" | "unread") => void;
    selectedUser: ChatUser | null;
    setSelectedUser: (user: ChatUser) => void;
    isInitialLoading: boolean;
}

export function UserList({
                             users,
                             searchQuery,
                             setSearchQuery,
                             selectedTab,
                             setSelectedTab,
                             selectedUser,
                             setSelectedUser,
                             isInitialLoading,
                         }: UserListProps) {
    // const isUserOnline = useOnlineStatusStore(state => state.isUserOnline);

    // Filter users based on search and tab
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === "" ||
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = true;
        if (selectedTab === "online") {
            matchesTab = user.is_online;
        } else if (selectedTab === "unread") {
            matchesTab = (user.unread_count || 0) > 0;
        }

        return matchesSearch && matchesTab;
    });

    return (
        <div
            className="flex flex-col h-full font-[Inter,-apple-system,sans-serif]"
            style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            }}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/[0.06] space-y-4 bg-[rgba(255,255,255,0.02)]">
                <h2 className="hidden lg:block font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
                    Admin Chat
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a5468]" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 h-10 rounded-[10px] bg-[rgba(255,255,255,0.02)] border-white/[0.06] text-[#eef2f7] placeholder:text-[#4a5468] focus-visible:border-[#00dfa2] focus-visible:ring-[rgba(0,223,162,0.1)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Tabs
                    value={selectedTab}
                    onValueChange={(value) => setSelectedTab(value as "all" | "online" | "unread")}
                    className="w-full"
                >
                    <TabsList className="grid grid-cols-3 bg-[rgba(255,255,255,0.02)] border border-white/[0.06] h-9 rounded-[10px] p-0.5">
                        <TabsTrigger
                            value="all"
                            className="rounded-[8px] text-[0.78rem] font-bold text-[#8b97a8] data-[state=active]:bg-[rgba(0,223,162,0.1)] data-[state=active]:text-[#00dfa2] data-[state=active]:shadow-none"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="online"
                            className="rounded-[8px] text-[0.78rem] font-bold text-[#8b97a8] data-[state=active]:bg-[rgba(0,223,162,0.1)] data-[state=active]:text-[#00dfa2] data-[state=active]:shadow-none"
                        >
                            Online
                        </TabsTrigger>
                        <TabsTrigger
                            value="unread"
                            className="rounded-[8px] text-[0.78rem] font-bold text-[#8b97a8] data-[state=active]:bg-[rgba(0,223,162,0.1)] data-[state=active]:text-[#00dfa2] data-[state=active]:shadow-none"
                        >
                            Unread
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
                {isInitialLoading ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 gap-2">
                        <Loader2 className="h-7 w-7 animate-spin text-[#00dfa2]" />
                        <p className="text-[0.82rem] text-[#8b97a8]">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
                            <MessageCircle className="h-5 w-5 text-[#4a5468]" />
                        </div>
                        <p className="text-center text-[0.82rem] text-[#8b97a8]">No users found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {filteredUsers.map(user => (
                            <button
                                key={user.id}
                                className={cn(
                                    "w-full flex items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150 border-l-2",
                                    selectedUser?.id === user.id
                                        ? "bg-[rgba(0,223,162,0.08)] border-l-[#00dfa2]"
                                        : "border-l-transparent"
                                )}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-10 w-10 border border-white/[0.06]">
                                        <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                        <AvatarFallback className="bg-[rgba(0,223,162,0.1)] text-[#00dfa2] text-[0.78rem] font-bold">
                                            {user.first_name[0]}{user.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.is_online && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#00dfa2] border-2 border-[#0a0d15] shadow-[0_0_8px_rgba(0,223,162,0.6)]"></div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-[0.88rem] font-extrabold text-[#eef2f7] truncate">
                                            {user.first_name} {user.last_name}
                                        </div>
                                        {user.unread_count && user.unread_count > 0 && (
                                            <Badge className="ml-2 bg-[rgba(244,63,94,0.12)] text-[#f43f5e] border border-[rgba(244,63,94,0.25)] text-[0.62rem] font-bold px-1.5 py-0">
                                                {user.unread_count}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-[0.72rem] text-[#4a5468] truncate font-mono">
                                        {user.account_id} • {user.email}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
