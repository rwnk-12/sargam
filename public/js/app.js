// /public/js/app.js
// This module acts as a central coordinator to prevent circular dependencies.
// It initializes the main components (player, ui) and exports them.

import { player as playerModule } from './player.js';
import { ui as uiModule, navigation as navigationModule } from './ui.js';

// Initialize the modules, passing references to each other.
// This is a form of dependency injection.
playerModule.init({ ui: uiModule });
uiModule.init({ player: playerModule });
navigationModule.init({ ui: uiModule });

// Export the initialized modules for the rest of the app to use.
export const player = playerModule;
export const ui = uiModule;
export const navigation = navigationModule;
