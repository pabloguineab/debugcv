"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';

interface SequenceContextType {
    currentStep: number;
    register: () => number;
    onComplete: (step: number) => void;
    isAnimating: boolean;
}

const SequenceContext = createContext<SequenceContextType | null>(null);

// Provider to manage the global sequence
export function SequentialAnimationProvider({
    children,
    animate = true,
    speedMultiplier = 1
}: {
    children: React.ReactNode;
    animate?: boolean;
    speedMultiplier?: number;
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const counterRef = useRef(0);
    // Use layout effect to ensure counter resets before children render passes
    // This is tricky in strict mode, so we might need a more robust registration if order matters critically
    // But for a linear document, render order usually matches visual order.

    // We reset the counter on every render to re-assign IDs? No, that causes mismatches.
    // We only want to assign IDs once.
    // Using a ref to track total registered items.

    const register = () => {
        const id = counterRef.current;
        counterRef.current += 1;
        return id;
    };

    const handleComplete = (step: number) => {
        // Move to next step
        setCurrentStep(prev => Math.max(prev, step + 1));
    };

    // If not animating, we effectively set currentStep to Infinity or handle inside components
    const effectiveStep = animate ? currentStep : Number.MAX_SAFE_INTEGER;

    // Reset counter when children unmount/remount is hard. 
    // Instead of auto-registration, let's just assume pure sequential rendering is hard to guarantee 
    // without manual indices or a recursive traverser.

    // ALTERNATIVE:
    // We just render children normally. Each Typewriter checks if "previous sibling" is done? No.

    // Let's stick to simple registration. For this specific resume use-case, components mount typically in order.
    // To ensure stability, we will reset counterRef only on full re-mounts or explicit reset.
    // Actually, React refs persist. 

    return (
        <SequenceContext.Provider value={{
            currentStep: effectiveStep,
            register,
            onComplete: handleComplete,
            isAnimating: animate
        }}>
            <CounterResetter />
            {children}
        </SequenceContext.Provider>
    );
}

// Helper to reset counter on re-renders of the provider
function CounterResetter() {
    const context = useContext(SequenceContext);
    // We actually can't easily reset the counter for *children* during parent render.
    // So we usually rely on children calling "register" inside useEffect? No, that's async.
    // Inside useMemo/useRef init? Yes.
    return null;
}


// WRAPPER Approch is flaky for arbitrary nesting.
// BETTER APPROACH FOR RESUME: 
// Manual "Sequence" component that children attach to.
// But that's verbose.

// SIMPLIFIED APPROACH:
// Just delay based on estimated reading time? 
// No, user wants completion trigger.

// Let's try the hook based registration.
// It works if the component tree is stable.
export function useSequentialWriter(text: string, speed: number = 20) {
    // Access context
    const context = useContext(SequenceContext);
    const [displayedText, setDisplayedText] = useState("");
    const [isDone, setIsDone] = useState(false);

    // Use refs to track state without triggering rerenders
    const hasRegistered = useRef(false);
    const stepIndexRef = useRef<number | null>(null);
    const hasStartedAnimating = useRef(false);
    const hasCompletedAnimation = useRef(false);
    const lockedTextRef = useRef<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Register once on mount
    useEffect(() => {
        if (!context) return;
        if (!hasRegistered.current) {
            stepIndexRef.current = context.register();
            hasRegistered.current = true;
        }
    }, [context]);

    // Typing logic - only run when it's our turn and we haven't completed
    useEffect(() => {
        const stepIndex = stepIndexRef.current;

        if (!context || stepIndex === null) {
            // If no context, just show text immediately
            if (!hasCompletedAnimation.current) {
                setDisplayedText(text);
                setIsDone(true);
                hasCompletedAnimation.current = true;
            }
            return;
        }

        // If not animating, show text immediately and keep syncing with prop changes
        if (!context.isAnimating) {
            setDisplayedText(text);
            if (!isDone) setIsDone(true);
            return;
        }

        // If we've already completed our animation, never restart
        if (hasCompletedAnimation.current) {
            return;
        }

        // If it's our turn and we haven't started yet
        if (context.currentStep === stepIndex && !hasStartedAnimating.current) {
            hasStartedAnimating.current = true;

            // Lock the text for this animation
            lockedTextRef.current = text;
            const textToAnimate = text;

            setDisplayedText("");
            setIsDone(false);

            let i = 0;
            intervalRef.current = setInterval(() => {
                setDisplayedText(textToAnimate.slice(0, i + 1));
                i++;
                if (i >= textToAnimate.length) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setIsDone(true);
                    hasCompletedAnimation.current = true;
                    context.onComplete(stepIndex);
                }
            }, speed);
        } else if (context.currentStep > stepIndex && !hasStartedAnimating.current) {
            // We skipped this step somehow (fast forward) - just show text
            setDisplayedText(text);
            setIsDone(true);
            hasCompletedAnimation.current = true;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [context?.currentStep, context?.isAnimating, speed, text]);

    return { displayedText, isDone, isActive: context?.currentStep === stepIndexRef.current };
}

// Component
export const Typewriter = ({
    text,
    speed = 15,
    className,
    tag: Tag = "span",
    ...props
}: {
    text: string;
    speed?: number;
    className?: string;
    tag?: React.ElementType;
    [key: string]: any;
}) => {
    const { displayedText, isActive } = useSequentialWriter(text || "", speed);

    // Cast to any to avoid TS issues with dynamic tags and children
    const Component = Tag as any;

    // Add blinking cursor if active
    return (
        <Component className={className} {...props}>
            {displayedText}
            {isActive && <span className="animate-pulse inline-block w-[1px] h-[1em] bg-black ml-[1px] align-middle">|</span>}
        </Component>
    );
};
