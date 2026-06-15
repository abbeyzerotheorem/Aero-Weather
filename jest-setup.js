import React from 'react';
import { View } from 'react-native';

// Mock Lottie animations to a simple View to avoid native dependency in tests
jest.mock('lottie-react-native', () => {
  return (props) => React.createElement(View, props, props.children);
});

// Silence native animated helper warning
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Optional: set testing-library cleanup behavior is automatic in recent versions
