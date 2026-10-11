export const terminalUser = 'richen';
export const homePath = `/home/${terminalUser}`;
export const homeSegments = ['home', terminalUser];
export const formatCwd = (cwd: string[]) => '/' + cwd.join('/');
export const formatPromptPath = (path: string) => path === homePath || path.startsWith(homePath + '/') ? '~' + path.slice(homePath.length) : path;
