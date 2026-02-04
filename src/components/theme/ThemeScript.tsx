export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || 'auto';
    var supported = ['light', 'dark', 'auto', 'high-contrast'];
    
    if (!supported.includes(theme)) {
      theme = 'auto';
    }

    var resolved = theme;
    if (theme === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (theme === 'high-contrast') {
      resolved = 'dark'; // High contrast is base dark
    }

    var root = document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    
    if (theme === 'high-contrast') {
      root.classList.add('dark', 'high-contrast');
    } else {
      root.classList.add(resolved);
    }
    
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

export function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: themeScript,
            }}
        />
    );
}
