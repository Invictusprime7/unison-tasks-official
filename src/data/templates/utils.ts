/**
 * Layout Templates - Utility Functions
 * Shared helpers for template generation
 */

/**
 * Wraps body content into a full HTML document with Tailwind CSS CDN
 */
export const wrapInHtmlDoc = (body: string, title: string = "AI Web Builder Template") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white">
  ${body}
</body>
</html>`;
