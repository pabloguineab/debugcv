"use client";

import { Player } from '@lordicon/react';
import { useRef, useEffect, useState } from 'react';

interface LordIconProps {
    src: string;
    size?: number;
    trigger?: 'hover' | 'click' | 'loop' | 'morph';
    colors?: string;
    onTrigger?: boolean; // External trigger for animation
}

export function LordIcon({
    src,
    size = 18,
    trigger = 'hover',
    colors,
    onTrigger = false
}: LordIconProps) {
    const playerRef = useRef<Player>(null);
    const [iconData, setIconData] = useState<any>(null);

    // Load icon JSON from URL
    useEffect(() => {
        fetch(src)
            .then(res => res.json())
            .then(data => setIconData(data))
            .catch(err => console.error('Failed to load icon:', err));
    }, [src]);

    // Play animation when external trigger changes
    useEffect(() => {
        if (onTrigger && playerRef.current) {
            playerRef.current.playFromBeginning();
        }
    }, [onTrigger]);

    if (!iconData) {
        return <div style={{ width: size, height: size }} />;
    }

    return (
        <div
            style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Player
                ref={playerRef}
                icon={iconData}
                size={size}
                colors={colors}
            />
        </div>
    );
}
