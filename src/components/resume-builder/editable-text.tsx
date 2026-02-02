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
    const measureRef = useRef<HTMLSpanElement>(null);
    const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);

    // Update local state when value prop changes
    useEffect(() => {
        if (!isEditing) {
            setEditValue(value);
        }
    }, [value, isEditing]);

    // Focus input when entering edit mode and measure width
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // Move cursor to end
            const length = editValue.length;
            inputRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    const handleClick = () => {
        // Measure the current text width before switching to edit mode
        if (measureRef.current) {
            const rect = measureRef.current.getBoundingClientRect();
            setInputWidth(Math.max(rect.width + 20, 100)); // Add padding, minimum 100px
        }
        // Mark as edited immediately when clicked - don't show animation again
        setHasBeenEdited(true);
        setIsEditing(true);
        setEditValue(value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== value) {
            onChange(editValue);
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

    // Calculate dynamic width based on content for non-multiline
    const dynamicWidth = multiline ? "100%" : inputWidth ? `${inputWidth}px` : "auto";

    if (isEditing) {
        const baseInputClass = `${className} bg-white border border-blue-400 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-blue-300`;

        const inputStyle: React.CSSProperties = {
            fontFamily: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            lineHeight: "inherit",
            width: dynamicWidth,
            minWidth: multiline ? "100%" : "80px",
            maxWidth: "100%"
        };

        if (multiline) {
            return (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`${baseInputClass} w-full resize-none`}
                    placeholder={placeholder}
                    style={{ ...inputStyle, minHeight: "60px" }}
                    rows={3}
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
                className={baseInputClass}
                placeholder={placeholder}
                style={inputStyle}
            />
        );
    }

    // Display mode - show displayComponent (typewriter) only if not edited
    // After user edits, show plain text instead of animation
    return (
        <span
            ref={measureRef}
            onClick={handleClick}
            className={`${className} cursor-pointer hover:bg-blue-50/50 rounded transition-colors`}
            title="Click to edit"
        >
            {hasBeenEdited
                ? (value || <span className="text-gray-400 italic">{placeholder}</span>)
                : (displayComponent || value || <span className="text-gray-400 italic">{placeholder}</span>)
            }
        </span>
    );
}
