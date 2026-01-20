import * as React from "react";
import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { ExtensionStorage } from "@bacons/apple-targets";
import { useColorScheme } from 'react-native';
import { ColorTheme, colorThemes } from '@/styles/commonStyles';
import { preferencesApi, themesApi, VisualTheme } from '@/utils/api';

// Initialize storage with your group ID
const storage = new ExtensionStorage(
  "group.com.<user_name>.<app_name>"
);

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    // set widget_state to null if we want to reset the widget
    // storage.set("widget_state", null);

    // Refresh widget
    ExtensionStorage.reloadWidget();
  }, []);

  const refreshWidget = useCallback(() => {
    ExtensionStorage.reloadWidget();
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};

// Theme Context for managing app-wide visual themes
interface ThemeContextType {
  currentTheme: ColorTheme;
  themeName: string;
  autoThemeByTime: boolean;
  availableThemes: string[];
  setTheme: (themeName: string) => void;
  toggleAutoTheme: () => void;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<string>('warmEarth');
  const [autoThemeByTime, setAutoThemeByTime] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(
    colorThemes.warmEarth[systemColorScheme ?? 'light']
  );

  const availableThemes = Object.keys(colorThemes);

  // Load user preferences from backend
  const loadPreferences = async () => {
    try {
      console.log('[ThemeProvider] Loading user preferences');
      const prefs = await preferencesApi.getPreferences();
      
      if (prefs.auto_theme_by_time) {
        setAutoThemeByTime(true);
        // Get the theme that should be active based on time of day
        const activeTheme = await preferencesApi.getCurrentTheme();
        applyBackendTheme(activeTheme);
      } else if (prefs.theme_details) {
        applyBackendTheme(prefs.theme_details);
      }
      
      console.log('[ThemeProvider] Preferences loaded:', prefs);
    } catch (error) {
      console.error('[ThemeProvider] Failed to load preferences:', error);
      // Fall back to default theme
      updateTheme('warmEarth');
    }
  };

  // Apply a theme from the backend
  const applyBackendTheme = (backendTheme: VisualTheme) => {
    const customTheme: ColorTheme = {
      background: backendTheme.background_color,
      card: backendTheme.card_color,
      text: backendTheme.text_color,
      textSecondary: backendTheme.text_secondary_color,
      primary: backendTheme.primary_color,
      secondary: backendTheme.secondary_color,
      accent: backendTheme.accent_color,
      highlight: backendTheme.card_color,
      border: backendTheme.text_secondary_color + '40',
      shadow: 'rgba(0, 0, 0, 0.12)',
      success: '#7A8B6F',
      warning: '#B89968',
      error: '#A67B6B',
    };
    
    setCurrentTheme(customTheme);
    setThemeName(backendTheme.theme_name);
  };

  // Update theme based on theme name
  const updateTheme = (newThemeName: string) => {
    const themeKey = newThemeName as keyof typeof colorThemes;
    if (colorThemes[themeKey]) {
      const scheme = systemColorScheme ?? 'light';
      setCurrentTheme(colorThemes[themeKey][scheme]);
      setThemeName(newThemeName);
      console.log('[ThemeProvider] Theme updated to:', newThemeName, scheme);
    }
  };

  // Set theme and save to backend
  const setTheme = async (newThemeName: string) => {
    console.log('[ThemeProvider] User selected theme:', newThemeName);
    updateTheme(newThemeName);
    
    try {
      // Get all themes from backend to find the matching theme ID
      const themes = await themesApi.getThemes();
      
      // Map frontend theme names to backend theme names
      const themeNameMap: Record<string, string> = {
        warmEarth: 'Warm Earth',
        softPastels: 'Soft Pastels',
        deepGrounding: 'Deep Grounding',
        neutralCalm: 'Neutral Calm',
        energizingDawn: 'Energizing Dawn',
      };
      
      const backendThemeName = themeNameMap[newThemeName] || newThemeName;
      const selectedTheme = themes.find(t => t.theme_name === backendThemeName);
      
      if (selectedTheme) {
        console.log('[ThemeProvider] Saving theme preference:', selectedTheme.id, selectedTheme.theme_name);
        await preferencesApi.updatePreferences({
          selected_theme_id: selectedTheme.id,
          auto_theme_by_time: false,
        });
      } else {
        console.warn('[ThemeProvider] Theme not found in backend:', backendThemeName);
        // Still disable auto theme even if we can't find the theme
        await preferencesApi.updatePreferences({
          auto_theme_by_time: false,
        });
      }
    } catch (error) {
      console.error('[ThemeProvider] Failed to save theme preference:', error);
    }
  };

  // Toggle auto theme by time of day
  const toggleAutoTheme = async () => {
    const newValue = !autoThemeByTime;
    setAutoThemeByTime(newValue);
    console.log('[ThemeProvider] Auto theme by time:', newValue);
    
    try {
      await preferencesApi.updatePreferences({
        auto_theme_by_time: newValue,
      });
      
      if (newValue) {
        // Load the appropriate theme for current time
        const activeTheme = await preferencesApi.getCurrentTheme();
        applyBackendTheme(activeTheme);
      }
    } catch (error) {
      console.error('[ThemeProvider] Failed to toggle auto theme:', error);
    }
  };

  // Refresh theme from backend
  const refreshTheme = async () => {
    await loadPreferences();
  };

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update theme when system color scheme changes
  useEffect(() => {
    if (!autoThemeByTime) {
      const themeKey = themeName as keyof typeof colorThemes;
      if (colorThemes[themeKey]) {
        const scheme = systemColorScheme ?? 'light';
        setCurrentTheme(colorThemes[themeKey][scheme]);
      }
    }
  }, [systemColorScheme, themeName, autoThemeByTime]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        autoThemeByTime,
        availableThemes,
        setTheme,
        toggleAutoTheme,
        refreshTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Admin Authentication Context
interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AdminAuth] Checking authentication status');
      const { adminAuthApi } = await import('@/utils/adminApi');
      const response = await adminAuthApi.checkAuth();
      setIsAdmin(response.isAdmin);
      console.log('[AdminAuth] Auth status:', response.isAdmin);
    } catch (error) {
      console.error('[AdminAuth] Failed to check auth:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('[AdminAuth] Attempting login');
      const { adminAuthApi } = await import('@/utils/adminApi');
      const response = await adminAuthApi.login(username, password);
      
      if (response.success && response.isAdmin) {
        setIsAdmin(true);
        console.log('[AdminAuth] Login successful');
        return true;
      } else {
        console.log('[AdminAuth] Login failed - not admin or invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('[AdminAuth] Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[AdminAuth] Logging out');
      const { adminAuthApi } = await import('@/utils/adminApi');
      await adminAuthApi.logout();
      setIsAdmin(false);
      console.log('[AdminAuth] Logout successful');
    } catch (error) {
      console.error('[AdminAuth] Logout error:', error);
      // Still set isAdmin to false even if API call fails
      setIsAdmin(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, login, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
