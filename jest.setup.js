// テストで使用するグローバルなセットアップを行う
import '@testing-library/jest-dom';

// フェッチのモック
global.fetch = jest.fn();

// IntersectionObserverのモック
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
}; 