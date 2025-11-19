'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HeroBackground() {
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Deep space base */}
            <div className="absolute inset-0 bg-black" />

            {/* Animated Gradient Orbs */}
            <motion.div
                animate={{
                    x: mousePosition.x * 20,
                    y: mousePosition.y * 20,
                }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-primary/20 rounded-full blur-[100px]"
                style={{
                    transition: 'transform 0.5s ease-out',
                }}
            />

            <motion.div
                animate={{
                    x: mousePosition.x * -30,
                    y: mousePosition.y * -30,
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-dark/10 rounded-full blur-[120px]"
                style={{
                    transition: 'transform 0.5s ease-out',
                }}
            />

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Floating Particles (Simulated with CSS/Motion) */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                        y: [null, Math.random() * -100],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}
