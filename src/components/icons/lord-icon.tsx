"use client";

import { useEffect, useRef } from 'react';

interface LordIconProps {
    src: string;
    trigger?: 'hover' | 'click' | 'loop' | 'morph';
    colors?: string;
    size?: number;
    className?: string;
}

export function LordIcon({
    src,
    trigger = 'hover',
    colors,
    size = 18,
    className = ''
}: LordIconProps) {
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Lordicon script
        const script = document.createElement('script');
        script.src = 'https://cdn.lordicon.com/lordicon.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const style = {
        width: `${size}px`,
        height: `${size}px`,
    };

    return (
        <div ref={iconRef} style={style} className={className}>
            <lord-icon
                src={src}
                trigger={trigger}
                colors={colors}
                style={style}
            />
        </div>
    );
}
