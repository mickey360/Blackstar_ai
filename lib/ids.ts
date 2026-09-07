export const uid=(prefix='id')=>`${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
