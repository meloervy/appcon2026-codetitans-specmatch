import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import HardwareImage from '@/Components/HardwareImage';
import SpecMatchLogo from '@/Components/SpecMatchLogo';
import SpecMatchMascot from '@/Components/SpecMatchMascot';
import {
    RiSendPlaneFill,
    RiCloseLine,
    RiRefreshLine,
    RiAlertLine,
    RiMoneyDollarCircleLine,
    RiToolsLine,
    RiArrowRightLine,
    RiCheckLine,
    RiSubtractLine,
    RiFullscreenLine,
    RiFullscreenExitLine,
    RiArrowDownLine,
    RiArrowDownSLine,
    RiArrowUpSLine,
    RiPencilLine,
    RiDeleteBinLine,
} from 'react-icons/ri';

/**
 * Format inline bold **text** and code `code`.
 */
function renderFormattedText(text) {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-bold text-slate-900 dark:text-zinc-100">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-[11px] font-mono text-[#026eff] dark:text-[#38bdf8]"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

/**
 * Robust markdown renderer supporting tables, blockquotes, headers, and bullet lists.
 */
function MarkdownRenderer({ content }) {
    if (!content) return null;

    const lines = content.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            i++;
            continue;
        }

        // Table block: line starts and ends with '|'
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }

            if (tableLines.length >= 2) {
                const headerCols = tableLines[0]
                    .split('|')
                    .slice(1, -1)
                    .map((c) => c.trim());

                const startRow = tableLines[1].includes('---') ? 2 : 1;
                const rowData = [];
                for (let r = startRow; r < tableLines.length; r++) {
                    const cells = tableLines[r]
                        .split('|')
                        .slice(1, -1)
                        .map((c) => c.trim());
                    rowData.push(cells);
                }

                blocks.push({
                    type: 'table',
                    headers: headerCols,
                    rows: rowData,
                });
                continue;
            }
        }

        // Blockquote (> )
        if (trimmed.startsWith('> ') || trimmed === '>') {
            const quoteLines = [];
            while (i < lines.length && (lines[i].trim().startsWith('>') || (quoteLines.length > 0 && lines[i].trim() !== '' && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('|')))) {
                quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            blocks.push({
                type: 'blockquote',
                text: quoteLines.join(' '),
            });
            continue;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
            blocks.push({ type: 'h4', text: trimmed.replace(/^###\s+/, '') });
            i++;
            continue;
        }
        if (trimmed.startsWith('## ')) {
            blocks.push({ type: 'h3', text: trimmed.replace(/^##\s+/, '') });
            i++;
            continue;
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            blocks.push({ type: 'bullet', text: trimmed.substring(2) });
            i++;
            continue;
        }

        // Horizontal rule
        if (trimmed === '---') {
            blocks.push({ type: 'hr' });
            i++;
            continue;
        }

        // Regular paragraph
        blocks.push({ type: 'p', text: trimmed });
        i++;
    }

    return (
        <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-zinc-200">
            {blocks.map((block, bIdx) => {
                if (block.type === 'table') {
                    return (
                        <div key={bIdx} className="overflow-x-auto my-2.5 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 shadow-2xs">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/90 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200">
                                        {block.headers.map((h, hIdx) => (
                                            <th key={hIdx} className="px-2.5 py-2 font-bold whitespace-nowrap">
                                                {renderFormattedText(h)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900/60">
                                    {block.rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition">
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="px-2.5 py-2 text-slate-700 dark:text-zinc-300">
                                                    {renderFormattedText(cell)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }

                if (block.type === 'blockquote') {
                    return (
                        <div key={bIdx} className="p-3 my-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500 text-xs text-amber-900 dark:text-amber-200 leading-normal">
                            {renderFormattedText(block.text)}
                        </div>
                    );
                }

                if (block.type === 'h4') {
                    return (
                        <h4 key={bIdx} className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 pt-1.5 pb-0.5">
                            {renderFormattedText(block.text)}
                        </h4>
                    );
                }

                if (block.type === 'h3') {
                    return (
                        <h3 key={bIdx} className="font-extrabold text-base text-slate-900 dark:text-zinc-100 pt-2 pb-1">
                            {renderFormattedText(block.text)}
                        </h3>
                    );
                }

                if (block.type === 'bullet') {
                    return (
                        <div key={bIdx} className="flex items-start gap-2 pl-2">
                            <span className="text-[#026eff] dark:text-[#38bdf8] font-bold shrink-0">•</span>
                            <div className="flex-1">{renderFormattedText(block.text)}</div>
                        </div>
                    );
                }

                if (block.type === 'hr') {
                    return <hr key={bIdx} className="border-slate-200/80 dark:border-zinc-800 my-2" />;
                }

                return <p key={bIdx}>{renderFormattedText(block.text)}</p>;
            })}
        </div>
    );
}

const defaultWelcomeMessage = {
    id: 'welcome',
    sender: 'assistant',
    category: 'general_itam',
    source: 'gemini-3.1-flash-lite',
    answer:
        "### Fukurou - SpecMatch AI Fleet Assistant\n\n" +
        "Kumusta! I am **Fukurou**, your official conversational ITAM Fleet Assistant. Ask me any question regarding stockroom inventory, idle devices, employee spec tiers, or warranties in **English or Tagalog**.",
    data_cards: [],
    suggested_followups: [
        'Which employees are using low end specs?',
        'How many idle devices do we currently have in inventory?',
        'Who is using the high end desktop?',
        'Which employees is using the high end computers?',
    ],
};

export default function GeminiFleetAssistant({ isOpen = false, onClose, onOpen }) {
    const [isFloatingOpen, setIsFloatingOpen] = useState(isOpen);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([defaultWelcomeMessage]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [starterFollowups, setStarterFollowups] = useState([]);
    const [collapsedMessages, setCollapsedMessages] = useState({});
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [aiStatus, setAiStatus] = useState({
        state: 'online',
        model: 'gemini-3.1-flash-lite',
        label: 'Gemini 3.1 Flash-Lite Active',
        sublabel: 'Online',
        tooltip: 'Gemini 3.1 Flash-Lite is online and grounded in real-time MySQL database context.',
        is_fallback: false,
    });

    // Customizable window sizing with constraints
    const [windowSize, setWindowSize] = useState(() => {
        try {
            const saved = localStorage.getItem('specmatch_fleet_assistant_size');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.width && parsed.height) return parsed;
            }
        } catch (e) {}
        return { width: 540, height: 650 };
    });

    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Save size preference
    useEffect(() => {
        try {
            localStorage.setItem('specmatch_fleet_assistant_size', JSON.stringify(windowSize));
        } catch (e) {}
    }, [windowSize]);

    // Sync external isOpen prop changes
    useEffect(() => {
        setIsFloatingOpen(isOpen);
    }, [isOpen]);

    // Initial context fetch on mount
    useEffect(() => {
        axios
            .get(route('fleet-assistant.context'))
            .then((res) => {
                if (res.data?.starter_followups) {
                    setStarterFollowups(res.data.starter_followups);
                }
                if (res.data?.ai_status) {
                    setAiStatus(res.data.ai_status);
                }
            })
            .catch(() => {});
    }, []);

    // Focus input and listen for ESC key when window opens
    useEffect(() => {
        if (isFloatingOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 150);

            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    handleClose();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isFloatingOpen]);

    const handleClose = () => {
        setIsFloatingOpen(false);
        if (onClose) onClose();
    };

    const handleOpen = () => {
        setIsFloatingOpen(true);
        if (onOpen) onOpen();
    };

    // Track scroll to toggle "Skip to bottom" button
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
        setShowScrollBottom(!isNearBottom);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // FAQ dropdown toggle
    const toggleCollapse = (msgId) => {
        setCollapsedMessages((prev) => ({
            ...prev,
            [msgId]: !prev[msgId],
        }));
    };

    // Unsend (delete) user message and its following response
    const handleUnsendMessage = (msgId) => {
        setMessages((prev) => {
            const index = prev.findIndex((m) => m.id === msgId);
            if (index === -1) return prev;

            const nextMsg = prev[index + 1];
            if (nextMsg && nextMsg.sender === 'assistant') {
                return [...prev.slice(0, index), ...prev.slice(index + 2)];
            }
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    // Edit user message (places text in input, undos message & response, focuses input)
    const handleEditMessage = (msgId) => {
        const msg = messages.find((m) => m.id === msgId);
        if (!msg) return;

        setInputPrompt(msg.text || '');
        handleUnsendMessage(msgId);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    // Reset conversation
    const handleClearChat = () => {
        setMessages([
            {
                id: 'welcome_reset_' + Date.now(),
                sender: 'assistant',
                category: 'general_itam',
                source: 'gemini-3.1-flash-lite',
                answer:
                    "Conversation reset. Ask me anything about our Metro Manila IT fleet, stockroom availability, who is using high-end computers, or warranties.",
                data_cards: [],
                suggested_followups: starterFollowups.length > 0 ? starterFollowups : [
                    'Which employees are using low end specs?',
                    'How many idle devices do we currently have in inventory?',
                    'Who is using the high end desktop?',
                    'Which employees is using the high end computers?',
                ],
            },
        ]);
        setInputPrompt('');
        setIsLoading(false);
        setCollapsedMessages({});
    };

    // Send query with multi-turn conversation memory history
    const handleSend = async (queryText) => {
        const textToSend = (queryText || inputPrompt).trim();
        if (!textToSend || isLoading) return;

        const userMsgId = 'user_' + Date.now();
        const userMsg = {
            id: userMsgId,
            sender: 'user',
            text: textToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const history = messages
            .filter((m) => !m.id.startsWith('welcome'))
            .slice(-8)
            .map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: (m.text || m.answer || '').slice(0, 10000),
            }));

        setMessages((prev) => [...prev, userMsg]);
        setInputPrompt('');
        setIsLoading(true);

        // Keep view anchored on user question / top of new response
        setTimeout(() => {
            const userEl = document.getElementById(userMsgId);
            if (userEl) {
                userEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);

        try {
            const response = await axios.post(route('fleet-assistant.query'), {
                prompt: textToSend,
                history: history,
            });

            const data = response.data;
            if (data.ai_status) {
                setAiStatus(data.ai_status);
            }
            const assistantMsg = {
                id: 'assistant_' + Date.now(),
                sender: 'assistant',
                category: data.category || 'general_itam',
                source: data.source || 'gemini-3.1-flash-lite',
                answer: data.answer || 'No response received from fleet assistant.',
                data_cards: data.data_cards || [],
                suggested_followups: data.suggested_followups || [],
            };

            setMessages((prev) => [...prev, assistantMsg]);
            // Do not drag all the way to bottom - stays anchored on question so user can read top-down
        } catch (error) {
            const status = error.response?.status;
            const isAuth = status === 401 || status === 419;
            const errorMsg = {
                id: 'err_' + Date.now(),
                sender: 'assistant',
                category: 'error',
                source: 'system',
                isAuth,
                loginUrl: error.response?.data?.login_url || '/login',
                answer: isAuth
                    ? 'Your session has expired (this occurs after an idle period or recent server redeployment). Please log in again to resume.'
                    : 'Unable to process query. The server or network encountered an issue: ' +
                      (error.response?.data?.message || error.message),
                data_cards: [],
                suggested_followups: isAuth
                    ? []
                    : ['Which employees are using low end specs?', 'How many idle devices do we currently have in inventory?'],
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Resizing logic for non-maximized mode
    const handleResizeStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = windowSize.width;
        const startHeight = windowSize.height;

        const onMouseMove = (moveEvent) => {
            const maxW = Math.min(920, window.innerWidth - 32);
            const minW = Math.min(380, maxW);
            const maxH = Math.min(900, window.innerHeight - 32);
            const minH = Math.min(460, maxH);

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction === 'left' || direction === 'top-left') {
                const deltaX = startX - moveEvent.clientX;
                newWidth = Math.min(Math.max(startWidth + deltaX, minW), maxW);
            }

            if (direction === 'top' || direction === 'top-left') {
                const deltaY = startY - moveEvent.clientY;
                newHeight = Math.min(Math.max(startHeight + deltaY, minH), maxH);
            }

            setWindowSize({ width: newWidth, height: newHeight });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        document.body.style.userSelect = 'none';
        if (direction === 'top-left') document.body.style.cursor = 'nwse-resize';
        else if (direction === 'top') document.body.style.cursor = 'ns-resize';
        else if (direction === 'left') document.body.style.cursor = 'ew-resize';

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <>
            {/* Minimized Floating Launcher Bubble */}
            {!isFloatingOpen && (
                <div className="fixed bottom-5 right-5 z-40">
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 hover:bg-sky-50 dark:hover:bg-zinc-800 text-[#026EFC] dark:text-[#38bdf8] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-[#026EFC] dark:border-[#026EFC]"
                        title="Open ITAM Fleet Assistant"
                    >
                        <SpecMatchMascot variant="avatar" size={24} pose="greeting" showGlow={false} isOnline={true} />
                        <span className="text-xs font-extrabold tracking-tight text-[#026EFC] dark:text-[#38bdf8] pr-0.5">
                            Talk to Fleet
                        </span>
                    </button>
                </div>
            )}

            {/* Floating Chat Window */}
            {isFloatingOpen && (
                <div
                    className={
                        isMaximized
                            ? 'fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none shadow-none bg-white dark:bg-zinc-900 border-none flex flex-col overflow-hidden font-sans'
                            : 'fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-50 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden font-sans'
                    }
                    style={
                        isMaximized
                            ? { width: '100vw', height: '100vh', inset: 0 }
                            : {
                                  width: `${windowSize.width}px`,
                                  height: `${windowSize.height}px`,
                                  maxWidth: 'calc(100vw - 2rem)',
                                  maxHeight: 'calc(100vh - 2rem)',
                              }
                    }
                >
                    {/* Resizing Handles (only when not maximized) */}
                    {!isMaximized && (
                        <>
                            {/* Top resize handle */}
                            <div
                                onMouseDown={(e) => handleResizeStart(e, 'top')}
                                className="absolute top-0 left-6 right-6 h-2 cursor-ns-resize z-30"
                                title="Drag to adjust height"
                            />
                            {/* Left resize handle */}
                            <div
                                onMouseDown={(e) => handleResizeStart(e, 'left')}
                                className="absolute top-6 left-0 bottom-6 w-2 cursor-ew-resize z-30"
                                title="Drag to adjust width"
                            />
                            {/* Top-Left resize corner grip */}
                            <div
                                onMouseDown={(e) => handleResizeStart(e, 'top-left')}
                                className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-40 group flex items-center justify-center p-1.5"
                                title="Drag to adjust width and height"
                            >
                                <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-slate-300 dark:border-zinc-600 group-hover:border-[#026eff] transition-colors rounded-tl" />
                            </div>
                        </>
                    )}

                    {/* Window Header */}
                    <div className="px-4 py-3 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/90 backdrop-blur-md shrink-0">
                        <div className={`flex items-center justify-between gap-3 ${isMaximized ? 'max-w-4xl mx-auto w-full' : ''}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                                <SpecMatchMascot
                                    variant="avatar"
                                    size={32}
                                    pose={isLoading ? 'thinking' : 'greeting'}
                                    showGlow={true}
                                    isOnline={aiStatus?.state === 'online'}
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm tracking-tight truncate">
                                            Fukurou &bull; Fleet Assistant
                                        </h3>
                                        {/* Live AI Status Pill */}
                                        {aiStatus && (
                                            <div
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                                                    aiStatus.state === 'online'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                                                        : aiStatus.state === 'quota_exceeded'
                                                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                                                        : aiStatus.state === 'credit_exhausted'
                                                        ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                                                }`}
                                                title={aiStatus.tooltip}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                        aiStatus.state === 'online'
                                                            ? 'bg-emerald-500 animate-pulse'
                                                            : aiStatus.state === 'quota_exceeded'
                                                            ? 'bg-amber-500'
                                                            : aiStatus.state === 'credit_exhausted'
                                                            ? 'bg-rose-500'
                                                            : 'bg-slate-400'
                                                    }`}
                                                />
                                                <span className="truncate max-w-[140px] sm:max-w-[220px]">
                                                    {aiStatus.state === 'online'
                                                        ? 'Gemini 3.1 Flash-Lite Active'
                                                        : aiStatus.state === 'quota_exceeded'
                                                        ? 'Gemini Quota Limit (Local DB Active)'
                                                        : aiStatus.state === 'credit_exhausted'
                                                        ? 'Gemini Credits Out (Local DB Active)'
                                                        : aiStatus.label || 'Local DB Engine Active'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                        {aiStatus?.is_fallback
                                            ? 'Real-time MySQL DB engine active with 100% database accuracy'
                                            : 'Ask about inventory, employee specs & mismatches'}
                                    </p>
                                </div>
                            </div>

                            {/* Controls: Reset, Maximize/Restore, Minimize, Close */}
                            <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleClearChat}
                                    title="Reset conversation"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    <RiRefreshLine className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsMaximized((prev) => !prev)}
                                    title={isMaximized ? 'Restore window size' : 'Maximize to full page'}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    {isMaximized ? (
                                        <RiFullscreenExitLine className="w-4 h-4" />
                                    ) : (
                                        <RiFullscreenLine className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    title="Minimize to bubble"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    <RiSubtractLine className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    title="Close assistant"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    <RiCloseLine className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Stream */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 relative"
                    >
                        <div className={`space-y-3.5 ${isMaximized ? 'max-w-4xl mx-auto w-full' : ''}`}>
                            {messages.map((msg) => (
                                <div key={msg.id} id={msg.id} className="space-y-2">
                                    {msg.sender === 'user' ? (
                                        /* User Bubble with Hover Edit & Unsend */
                                        <div className="group flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 dark:text-zinc-500 mr-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditMessage(msg.id)}
                                                    className="hover:text-[#026eff] dark:hover:text-[#38bdf8] flex items-center gap-0.5 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                                    title="Edit question (undos response)"
                                                >
                                                    <RiPencilLine className="w-3 h-3" />
                                                    <span>Edit</span>
                                                </button>
                                                <span>•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnsendMessage(msg.id)}
                                                    className="hover:text-red-500 flex items-center gap-0.5 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                                    title="Unsend question (undos response)"
                                                >
                                                    <RiDeleteBinLine className="w-3 h-3" />
                                                    <span>Unsend</span>
                                                </button>
                                            </div>
                                            <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#026eff] text-white px-3.5 py-2 shadow-sm text-xs sm:text-sm">
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                <div className="text-[9px] text-blue-200 mt-1 text-right">
                                                    {msg.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Assistant Bubble */
                                        <div className="flex items-start gap-2.5">
                                            <SpecMatchMascot
                                                variant="avatar"
                                                size={28}
                                                pose={msg.category === 'maintenance' ? 'active' : msg.category === 'mismatch' ? 'thinking' : msg.id === 'welcome' ? 'greeting' : 'happy'}
                                                showGlow={false}
                                                isOnline={false}
                                                className="mt-0.5"
                                            />

                                            <div className="flex-1 min-w-0 max-w-[94%] space-y-2.5">
                                                <div className="rounded-2xl rounded-tl-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 p-3.5 shadow-2xs transition-all">
                                                    {/* Meta bar: category + engine source + FAQ Minimize Toggle */}
                                                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200/60 dark:border-zinc-700/60 text-[9px] text-slate-500 dark:text-zinc-400">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300">
                                                                {msg.category.replace('_', ' ')}
                                                            </span>
                                                            <span className="flex items-center gap-1 font-medium">
                                                                {msg.source && msg.source.includes('gemini') ? (
                                                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                        <RiCheckLine className="w-3 h-3" /> Gemini 3.1 Flash-Lite Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                                                        Live MySQL DB Grounding
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* FAQ Minimize / Expand dropdown button */}
                                                        {msg.id !== 'welcome' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleCollapse(msg.id)}
                                                                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200/70 dark:hover:bg-zinc-700/60 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition cursor-pointer text-[10px] shrink-0"
                                                                title={collapsedMessages[msg.id] ? 'Expand response' : 'Minimize response'}
                                                            >
                                                                <span>{collapsedMessages[msg.id] ? 'Expand' : 'Minimize'}</span>
                                                                {collapsedMessages[msg.id] ? (
                                                                    <RiArrowDownSLine className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <RiArrowUpSLine className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Collapsible Content */}
                                                    {!collapsedMessages[msg.id] ? (
                                                        <>
                                                            {/* Text Answer with Markdown & Tables */}
                                                            <MarkdownRenderer content={msg.answer} />

                                                            {/* Auth Session Expired Action Button */}
                                                            {msg.isAuth && (
                                                                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-2">
                                                                    <a
                                                                        href={msg.loginUrl || '/login'}
                                                                        className="px-3.5 py-1.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                                                    >
                                                                        Log In to Resume
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* Render Actionable Data Cards */}
                                                            {msg.data_cards && msg.data_cards.length > 0 && (
                                                                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-2">
                                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                                                                        <span>Actionable Fleet Records ({msg.data_cards.length})</span>
                                                                        <span className="text-[9px] lowercase font-normal">click to assign or view</span>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {msg.data_cards.map((card, cIdx) => (
                                                                            <div
                                                                                key={cIdx}
                                                                                className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 hover:border-[#026eff]/60 dark:hover:border-[#026eff]/60 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                                                            >
                                                                                <div className="flex items-start gap-2.5 min-w-0">
                                                                                    {card.type === 'device' ? (
                                                                                        <HardwareImage
                                                                                            src={card.image_url}
                                                                                            alt={card.name}
                                                                                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200/50 dark:border-zinc-800"
                                                                                        />
                                                                                    ) : card.type === 'mismatch' ? (
                                                                                        <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                                                                            <RiAlertLine className="w-4 h-4" />
                                                                                        </div>
                                                                                    ) : card.type === 'maintenance' ? (
                                                                                        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                                                                            <RiToolsLine className="w-4 h-4" />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                                                            <RiMoneyDollarCircleLine className="w-4 h-4" />
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="min-w-0">
                                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                                            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate">
                                                                                                {card.name}
                                                                                            </span>
                                                                                            {card.asset_tag && (
                                                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
                                                                                                    {card.asset_tag}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>

                                                                                        <p className="text-[10px] text-slate-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                                                                                            {card.specs}
                                                                                        </p>

                                                                                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-500 dark:text-zinc-400">
                                                                                            {card.location && <span>{card.location}</span>}
                                                                                            {card.meta && (
                                                                                                <span className="font-medium text-[#026eff] dark:text-[#38bdf8]">
                                                                                                    {card.meta}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                                                    {card.type === 'device' && card.status === 'available' ? (
                                                                                        <Link
                                                                                            href={`/match?device_id=${card.id}`}
                                                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#026eff] hover:bg-[#0256cc] text-white text-[10px] font-semibold transition"
                                                                                        >
                                                                                            <span>Assign</span>
                                                                                            <RiArrowRightLine className="w-2.5 h-2.5" />
                                                                                        </Link>
                                                                                    ) : null}

                                                                                    {card.action_url && (
                                                                                        <Link
                                                                                            href={card.action_url}
                                                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                                                                                        >
                                                                                            <span>View</span>
                                                                                            <RiArrowRightLine className="w-2.5 h-2.5" />
                                                                                        </Link>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div
                                                            onClick={() => toggleCollapse(msg.id)}
                                                            className="py-1 text-xs text-slate-400 dark:text-zinc-500 italic cursor-pointer hover:text-slate-600 dark:hover:text-zinc-300 select-none"
                                                        >
                                                            Response minimized. Click to expand answer and fleet data...
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Suggested follow-up prompt chips */}
                                                {!collapsedMessages[msg.id] && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                        {msg.suggested_followups.map((chip, chipIdx) => (
                                                            <button
                                                                key={chipIdx}
                                                                type="button"
                                                                onClick={() => handleSend(chip)}
                                                                className="text-left px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700 hover:border-[#026eff] dark:hover:border-[#38bdf8] hover:text-[#026eff] dark:hover:text-[#38bdf8] transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#026EFC]" />
                                                                <span>{chip}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex items-start gap-2.5">
                                    <SpecMatchMascot
                                        variant="avatar"
                                        size={28}
                                        pose="thinking"
                                        showGlow={true}
                                        isOnline={true}
                                        className="mt-0.5 animate-pulse"
                                    />
                                    <div className="rounded-2xl rounded-tl-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 p-3 shadow-2xs">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                                            <span className="w-2 h-2 rounded-full bg-[#026EFC] animate-ping" />
                                            <span>Reading fleet database & reasoning...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Floating Skip to Bottom Button */}
                    {showScrollBottom && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={scrollToBottom}
                                className="absolute bottom-3 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs border border-white/20 dark:border-zinc-800"
                                title="Skip all the way to bottom"
                            >
                                <span>Skip to bottom</span>
                                <RiArrowDownLine className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Footer / Input Area */}
                    <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/90 backdrop-blur-md shrink-0">
                        <div className={`${isMaximized ? 'max-w-4xl mx-auto w-full' : ''}`}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="relative flex items-center gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    placeholder="Ask questions (e.g. 'Which employees are using low end specs?')..."
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#026eff] focus:outline-none focus:ring-1 focus:ring-[#026eff] pr-10 shadow-2xs"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputPrompt.trim() || isLoading}
                                    className={`absolute right-1.5 p-1.5 rounded-lg font-semibold transition cursor-pointer ${
                                        inputPrompt.trim() && !isLoading
                                            ? 'bg-[#026eff] text-white hover:bg-[#0256cc] shadow-sm'
                                            : 'bg-slate-100 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                                    }`}
                                >
                                    <RiSendPlaneFill className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
