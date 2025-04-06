import EventLoop from './runloop';

export * from './typedef';
export { default as Task } from './task';
export { default as EventLoop, sleep } from './runloop';


export const runloop = new EventLoop();

export default runloop;
