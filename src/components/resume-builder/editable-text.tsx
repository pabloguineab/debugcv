"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface EditableTextProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
    displayComponent?: React.ReactNode; // For typewriter animation
}

export function EditableText({
    value,
    onChange,
    placeholder = "Click to edit",
    className = "",
    multiline = false,
    displayComponent
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    // Track if user has manually edited - if so, don't show animation
    const [hasBeenEdited, setHasBeenEdited] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLSpanElement>(null);

    // Update local state when value prop changes
    useEffect(() => {
        if (!isEditing) {
            setEditValue(value);
        }
    }, [value, isEditing]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // Move cursor to end
            const length = editValue.length;
            inputRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    const handleClick = () => {
        setIsEditing(true);
        setEditValue(value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== value) {
            onChange(editValue);
            // Mark as edited so we don't show typewriter animation anymore
            setHasBeenEdited(true);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === "Escape") {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    // Common input styles - full width to match text display
    const inputStyle: React.CSSProperties = { 
        fontFamily: "inherit", 
        fontSize: "inherit",
        fontWeight: "inherit",
        lineHeight: "inherit",
        width: "100%",
        minWidth: "200px"
    };

    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`${className} w-full bg-white border border-blue-400 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-300 resize-none`}
                    placeholder={placeholder}
                    style={inputStyle}
                    rows={4}
                />
            );
        }

        return (
            <input 
                type="text"
                ref={inputRef as React.RefObject<HTMLInputElement>}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`${className} bg-white border border-blue-400 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-blue-300`}
                placeholder={placeholder}
                style={inputStyle}
            />
        );
    }

    // Display mode - show displayComponent (typewriter) only if not edited
    // After user edits, show plain text instead of animation
    return (
        <span
            ref={containerRef}
            onClick={handleClick}
            className={`${className} cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition-colors inline`}
            title="Click to edit"
        >
            {hasBeenEdited 
                ? (value || <span className="text-gray-400 italic">{placeholder}</span>)
                : (displayComponent || value || <span className="text-gray-400 italic">{placeholder}</span>)
            }
        </span>
    );
}
