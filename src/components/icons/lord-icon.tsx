"use client";

import { Player } from '@lordicon/react';
import { useRef } from 'react';

interface LordIconProps {
    src: string;
    size?: number;
    trigger?: 'hover' | 'click' | 'loop' | 'morph';
    colors?: string;
}

export function LordIcon({
    src,
    size = 18,
    trigger = 'hover',
    colors
}: LordIconProps) {
    const playerRef = useRef<Player>(null);

    const handleMouseEnter = () => {
        if (trigger === 'hover') {
            playerRef.current?.playFromBeginning();
        }
    };

    const handleClick = () => {
        if (trigger === 'click') {
            playerRef.current?.playFromBeginning();
        }
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            style={{ width: size, height: size, display: 'inline-block' }}
        >
            <Player
                ref={playerRef}
                icon={src}
                size={size}
                colors={colors}
            />
        </div>
    );
}
