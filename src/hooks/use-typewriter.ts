"use client";

import { useState, useEffect } from "react";

interface UseTypewriterOptions {
    text: string;
    speed?: number;
    delay?: number;
    enabled?: boolean;
}

export function useTypewriter({ 
    text, 
    speed = 30, 
    delay = 0,
    enabled = true 
}: UseTypewriterOptions) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setDisplayedText(text);
            setIsComplete(true);
            return;
        }

        setDisplayedText("");
        setIsComplete(false);

        if (!text) {
            setIsComplete(true);
            return;
        }

        let currentIndex = 0;
        const delayTimeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(interval);
                    setIsComplete(true);
                }
            }, speed);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(delayTimeout);
    }, [text, speed, delay, enabled]);

    return { displayedText, isComplete };
}

// Progressive reveal for arrays (experience, education, etc.)
export function useProgressiveReveal<T>({
    items,
    intervalMs = 500,
    enabled = true
}: {
    items: T[];
    intervalMs?: number;
    enabled?: boolean;
}) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setVisibleCount(items.length);
            setIsComplete(true);
            return;
        }

        setVisibleCount(0);
        setIsComplete(false);

        if (items.length === 0) {
            setIsComplete(true);
            return;
        }

        let count = 0;
        const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= items.length) {
                clearInterval(interval);
                setIsComplete(true);
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [items.length, intervalMs, enabled]);

    return {
        visibleItems: items.slice(0, visibleCount),
        isComplete,
        visibleCount
    };
}
