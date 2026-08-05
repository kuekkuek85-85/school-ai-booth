'use client';
/**
 * GradientText — 흐르는 그라디언트 텍스트 (react-bits 스타일, MIT / David Haz 참고).
 * 원본이 motion 의존이라, 동일 룩을 순수 CSS로 재현(의존성 0).
 */
import React from 'react';
import './GradientText.css';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number; // 초
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'],
  animationSpeed = 8,
  as: Tag = 'span',
  style
}: GradientTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`;
  return (
    <Tag
      className={`rb-gradient-text ${className}`}
      style={{
        backgroundImage: gradient,
        animationDuration: `${animationSpeed}s`,
        ...style
      }}
    >
      {children}
    </Tag>
  );
}
