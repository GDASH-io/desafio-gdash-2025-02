import React from 'react';

interface AnimatedNumberProps {
    value: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value }) => {
    const [display, setDisplay] = React.useState(value);
    React.useEffect(() => {
        let start = display;
        let raf: number | undefined;
        const step = () => {
            if (start === value) return;
            const diff = value - start;
            start += diff * 0.2;
            if (Math.abs(diff) < 0.5) {
                setDisplay(value);
            } else {
                setDisplay(Math.round(start));
                raf = requestAnimationFrame(step);
            }
        };
        step();
        return () => { if (raf) cancelAnimationFrame(raf); };
        // eslint-disable-next-line
    }, [value]);
    return <span>{Math.round(display)}</span>;
};
