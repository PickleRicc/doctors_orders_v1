'use client';

import { motion } from 'framer-motion';

export default function InfiniteMarquee({ items, speed = 20 }) {
    return (
        <div className="relative flex overflow-hidden py-10 group">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

            <motion.div
                className="flex gap-12 whitespace-nowrap"
                animate={{ x: [0, -1035] }} // Adjust based on content width
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {[...items, ...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-500 font-medium text-lg">
                        {item}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
