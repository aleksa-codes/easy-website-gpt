export const getPageContent = async (): Promise<{
  title: string;
  content: string;
  url: string;
  metadata: {
    description?: string;
    keywords?: string;
  };
}> => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              func: () => {
                // Get main content while excluding navigation, footer, etc.
                const mainContent = document.querySelector('main') || document.querySelector('article');
                const contentText = mainContent
                  ? mainContent.innerText
                  : Array.from(document.body.children)
                      .filter((el) => {
                        const tag = el.tagName.toLowerCase();
                        return !['header', 'nav', 'footer', 'script', 'style'].includes(tag);
                      })
                      .map((el) => (el as HTMLElement).innerText)
                      .join('\n');

                // Get metadata
                const description =
                  document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined;
                const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || undefined;

                return {
                  title: document.title,
                  content: contentText,
                  url: window.location.href,
                  metadata: {
                    description,
                    keywords,
                  },
                };
              },
            },
            (result) => {
              resolve(
                result?.[0]?.result || {
                  title: '',
                  content: '',
                  url: '',
                  metadata: {},
                },
              );
            },
          );
        } else {
          resolve({
            title: '',
            content: '',
            url: '',
            metadata: {},
          });
        }
      });
    });
  }
  return {
    title: 'Development environment',
    content: 'Development environment - page content not available',
    url: 'localhost',
    metadata: {},
  };
};
