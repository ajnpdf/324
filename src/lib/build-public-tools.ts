import { PUBLIC_TOOLS } from './tools-data';
import { filterBuildAvailableTools } from './tool-capabilities';

export const BUILD_PUBLIC_TOOLS = filterBuildAvailableTools(PUBLIC_TOOLS);
export const BUILD_PUBLIC_TOOL_IDS = new Set(BUILD_PUBLIC_TOOLS.map((tool) => tool.id));
