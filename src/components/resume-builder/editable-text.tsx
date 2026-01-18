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
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

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
            inputRef.current.select();
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

    if (isEditing) {
        const commonProps = {
            ref: inputRef as any,
            value: editValue,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
            className: `${className} bg-white border border-blue-400 rounded px-1 outline-none focus:ring-2 focus:ring-blue-300`,
            placeholder,
            style: { 
                fontFamily: "inherit", 
                fontSize: "inherit",
                fontWeight: "inherit",
                lineHeight: "inherit"
            }
        };

        if (multiline) {
            return (
                <textarea
                    {...commonProps}
                    rows={3}
                    className={`${commonProps.className} w-full resize-none`}
                />
            );
        }

        return <input type="text" {...commonProps} />;
    }

    // Display mode - show displayComponent (typewriter) or the value
    return (
        <span
            onClick={handleClick}
            className={`${className} cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition-colors inline-block`}
            title="Click to edit"
        >
            {displayComponent || value || <span className="text-gray-400 italic">{placeholder}</span>}
        </span>
    );
}
