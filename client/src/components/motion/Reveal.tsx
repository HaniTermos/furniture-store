'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    duration?: number;
    once?: boolean;
}

const directionMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
};

export function Reveal({
    children,
    className,
    delay = 0,
    direction = 'up',
    duration = 0.7,
    once = true,
}: RevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-50px' });
    const offset = directionMap[direction];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...offset }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
            transition={{ duration, delay, ease: [0.19, 1, 0.22, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    stagger?: number;
    once?: boolean;
}

export function StaggerContainer({
    children,
    className,
    stagger = 0.1,
    once = true,
}: StaggerContainerProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-50px' });

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: stagger,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerChild({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

interface CountUpProps {
    end: number;
    suffix?: string;
    duration?: number;
    className?: string;
}

export function CountUp({ end, suffix = '', duration = 2, className }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView || !ref.current) return;

        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const value = Math.floor(eased * end);
            if (ref.current) {
                ref.current.textContent = value.toLocaleString() + suffix;
            }
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, end, suffix, duration]);

    return (
        <span ref={ref} className={className}>
            0{suffix}
        </span>
    );
}
