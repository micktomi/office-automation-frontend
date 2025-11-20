'use client';

import { useState, useEffect } from "react";
import { getEmails, syncEmails, archiveEmail } from "@/lib/api";
import Link from "next/link";

// --- TYPE DEFINITIONS ---
interface Email {
  id: number;
  subject: string;
  sender: string;
  priority: "high" | "medium" | "low";
  unread: boolean;
  timestamp: string;
  body: string | null;
  ai_analysis: string | null;
}

interface AIAnalysis {
    priority: "high" | "medium" | "low";
    needs_reply: boolean;
    suggested_action: "reply" | "archive" | "flag";
    category: "work" | "personal" | "spam" | "urgent";
}

// --- SVG ICONS ---
const SyncIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a8.25 8.25 0 0 0-11.667 0v3.183" />
    </svg>
);

const ArchiveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);


// --- NEW: Component to parse and create clickable links ---
const ClickableText = ({ text }: { text: string | null }) => {
    if (!text) return <p>This email has no body content.</p>;

    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/ig;
    
    const parts = text.split(urlRegex).filter(part => part !== undefined);

    return (
        <p>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    const url = part.startsWith('www.') ? `http://${part}` : part.includes('@') ? `mailto:${part}` : part;
                    return <a key={i} href={url} className="text-sky-400 hover:underline" target="_blank" rel="noopener noreferrer">{part}</a>;
                }
                return <span key={i}>{part}</span>;
            })}
        </p>
    );
};


// --- CHILD COMPONENTS (REDESIGNED) ---

const PriorityBadge = ({ priority }: { priority: Email['priority'] }) => {
  const styles = {
    high: "bg-red-500/10 text-red-400 border border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    low: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority] || 'bg-slate-700'}`}>{priority}</span>;
};

const EmailListItem = ({ email, onClick, isSelected }: { email: Email; onClick: () => void; isSelected: boolean }) => (
  <div 
    onClick={onClick} 
    className={`p-4 rounded-xl mb-3 cursor-pointer transition-all duration-300 border ${
      isSelected 
        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10' 
        : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50'
    }`}
  >
    <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-semibold text-slate-200 truncate pr-4 flex items-center gap-2">
          {email.unread && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
          {email.sender}
        </p>
        <PriorityBadge priority={email.priority} />
    </div>
    <p className="text-slate-300 font-medium mb-2 truncate leading-tight">{email.subject}</p>
    <div className="flex justify-between items-center">
      <p className="text-xs text-slate-500">{email.timestamp}</p>
      {email.ai_analysis && (
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
          AI ✨
        </span>
      )}
    </div>
  </div>
);

const EmailList = ({ emails, onEmailClick, selectedEmailId }: { emails: Email[]; onEmailClick: (email: Email) => void; selectedEmailId: number | null; }) => (
  <div className="h-full overflow-y-auto pr-2 scrollbar-hide">
    {emails.length > 0 ? (
      <div className="space-y-2">
        {emails.map((email) => (
          <EmailListItem 
            key={email.id} 
            email={email} 
            onClick={() => onEmailClick(email)} 
            isSelected={email.id === selectedEmailId} 
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-16">
        <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">📭</span>
        </div>
        <p className="text-slate-400 font-medium mb-2">No emails found</p>
        <p className="text-slate-500 text-sm">Try syncing to fetch your latest emails</p>
      </div>
    )}
  </div>
);

const AISuggestions = ({ analysis }: { analysis: AIAnalysis }) => (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
        <h3 className="font-bold text-xl mb-6 text-slate-200 flex items-center gap-2">
          ✨ AI Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/30">
                <p className="text-slate-400 mb-2 font-medium">Priority Level</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    analysis.priority === 'high' ? 'bg-red-400' : 
                    analysis.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <p className="font-semibold text-slate-100 capitalize">{analysis.priority}</p>
                </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/30">
                <p className="text-slate-400 mb-2 font-medium">Needs Reply?</p>
                <p className={`font-semibold flex items-center gap-2 ${analysis.needs_reply ? 'text-green-400' : 'text-slate-300'}`}>
                  <span>{analysis.needs_reply ? '✅' : '❌'}</span>
                  {analysis.needs_reply ? 'Yes' : 'No'}
                </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/30">
                <p className="text-slate-400 mb-2 font-medium">Suggested Action</p>
                <p className="font-semibold text-slate-100 capitalize flex items-center gap-2">
                  <span>{analysis.suggested_action === 'reply' ? '↩️' : analysis.suggested_action === 'archive' ? '📦' : '🚩'}</span>
                  {analysis.suggested_action}
                </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/30">
                <p className="text-slate-400 mb-2 font-medium">Category</p>
                <p className="font-semibold text-slate-100 capitalize flex items-center gap-2">
                  <span>{analysis.category === 'work' ? '💼' : analysis.category === 'personal' ? '👤' : analysis.category === 'urgent' ? '🚨' : '🗑️'}</span>
                  {analysis.category}
                </p>
            </div>
        </div>
    </div>
);

const EmailDetail = ({ email, onArchive }: { email: Email; onArchive: (emailId: number) => void; }) => {
    let analysis: AIAnalysis | null = null;
    try {
        analysis = email.ai_analysis ? JSON.parse(email.ai_analysis) : null;
    } catch (e) {
        console.error("Failed to parse AI analysis JSON:", e);
    }

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="border-b border-slate-600/50 pb-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-slate-100 leading-tight pr-4">{email.subject}</h2>
                    <button 
                      onClick={() => onArchive(email.id)} 
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
                    >
                        <ArchiveIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">From:</span>
                      <span className="font-medium text-slate-300 bg-slate-700/30 px-3 py-1 rounded-lg">
                        {email.sender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-medium text-slate-300">{email.timestamp}</span>
                    </div>
                    {email.unread && (
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                        Unread
                      </span>
                    )}
                </div>
            </div>
            
            {analysis && <AISuggestions analysis={analysis} />}

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  📄 Email Content
                </h3>
                <div className="bg-slate-700/20 rounded-xl p-6 prose prose-slate prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-600/30">
                    <ClickableText text={email.body} />
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const fetchedEmails = await getEmails();
      setEmails(fetchedEmails);
      if (fetchedEmails.length > 0) {
          setSelectedEmail(fetchedEmails[0]);
      } else {
          setSelectedEmail(null);
      }
    } catch (err) {
      setError("Failed to fetch emails.");
      console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await syncEmails();
      await fetchEmails(); // Refetch emails after sync
    } catch (err) {
      setError("Failed to sync emails.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSelect = (email: Email) => {
      setSelectedEmail(email);
  };

  const handleArchive = async (emailId: number) => {
    setIsArchiving(true);
    try {
        await archiveEmail(emailId);
        // Instant UI update
        const newEmails = emails.filter(e => e.id !== emailId);
        setEmails(newEmails);

        if (selectedEmail?.id === emailId) {
            const currentIndex = emails.findIndex(e => e.id === emailId);
            // Select next email or previous, or null if list becomes empty
            const nextEmail = newEmails[currentIndex] || newEmails[currentIndex - 1] || null;
            setSelectedEmail(nextEmail);
        }
    } catch (err) {
        setError("Failed to archive email.");
        console.error(err);
    } finally {
        setIsArchiving(false);
    }
  };

  return (
    <main className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 font-sans">
      <header className="flex items-center justify-between p-6 border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PA</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Productivity Agent
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            {emails.length} emails
          </div>
          <Link 
            href="/chat"
            className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            <span>🤖</span>
            <span className="hidden md:inline">AI Assistant</span>
          </Link>
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-slate-200 bg-slate-700/80 rounded-xl hover:bg-slate-600/80 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm border border-slate-600/50"
          >
            <SyncIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isLoading ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-xl backdrop-blur-sm">
          <p className="text-red-300 font-medium">⚠️ {error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 h-[calc(100vh-100px)]">
          <div className="md:col-span-1 lg:col-span-1 h-full">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 h-full p-4">
                <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  📧 Inbox
                  {emails.length > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {emails.length}
                    </span>
                  )}
                </h2>
                <EmailList emails={emails} onEmailClick={handleEmailSelect} selectedEmailId={selectedEmail?.id || null} />
              </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3 h-full">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 h-full">
                {isLoading && emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-slate-400">Loading your inbox...</p>
                    </div>
                ) : selectedEmail ? (
                    <EmailDetail email={selectedEmail} onArchive={handleArchive} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">📬</span>
                        </div>
                        <p className="text-slate-400 text-lg mb-2">No email selected</p>
                        <p className="text-slate-500 text-sm">Choose an email from the inbox or sync to get started</p>
                    </div>
                )}
              </div>
          </div>
      </div>
    </main>
  );
}
