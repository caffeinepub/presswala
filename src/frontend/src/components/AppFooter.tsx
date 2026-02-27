export default function AppFooter() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'presswala');

  return (
    <footer className="border-t border-border bg-card py-4 px-4 text-center">
      <p className="text-xs text-muted-foreground">
        © {year} PressWala. Built with{' '}
        <span className="text-primary">♥</span>{' '}
        using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}
