import Svg, { Path } from 'react-native-svg';

type SimboloBroteProps = {
    tamano?: number;
    color?: string;
};

// Pequeño brote de dos hojas, usado como marca durante el ritual de bienvenida.
export function SimboloBrote({ tamano = 72, color = '#F8E7C9' }: SimboloBroteProps) {
    return (
        <Svg width={tamano} height={tamano} viewBox="0 0 100 100" fill="none">
            <Path
                d="M50 88V52"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
            />
            <Path
                d="M50 60C50 60 26 56 22 34C22 34 48 30 50 60Z"
                fill={color}
            />
            <Path
                d="M50 52C50 52 74 47 78 24C78 24 50 20 50 52Z"
                fill={color}
            />
        </Svg>
    );
}
