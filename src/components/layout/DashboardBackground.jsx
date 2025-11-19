'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DashboardBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#fbfbfa] dark:bg-[#0a0a0a] transition-colors duration-500">
            {/* Ambient Gradients */}
            <motion.div
                animate={{
                    x: mousePosition.x * 10,
                    y: mousePosition.y * 10,
                }}
                className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px]"
                style={{ transition: 'transform 0.5s ease-out' }}
            />

            <motion.div
                animate={{
                    x: mousePosition.x * -15,
                    y: mousePosition.y * -15,
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 dark:bg-indigo-600/10 rounded-full blur-[120px]"
                style={{ transition: 'transform 0.5s ease-out' }}
            />

            {/* Subtle Grid */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Dark mode specific grid override */}
            <div
                className="absolute inset-0 opacity-0 dark:opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    );
}
