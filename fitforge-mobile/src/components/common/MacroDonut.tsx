import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Ring = {
  value: number;
  max: number;
  color: string;
};

type Props = {
  rings: Ring[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  children?: React.ReactNode;
};

export function MacroDonut({ rings, size = 120, strokeWidth = 10, gap = 4, children }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {rings.map((ring, index) => {
          const radius = size / 2 - strokeWidth / 2 - index * (strokeWidth + gap);
          const circumference = 2 * Math.PI * radius;
          const clamped = Math.max(0, Math.min(1, ring.max > 0 ? ring.value / ring.max : 0));
          const dashOffset = circumference * (1 - clamped);
          return (
            <React.Fragment key={index}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#F0EEF8"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                fill="none"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      {children && <View style={styles.center}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
