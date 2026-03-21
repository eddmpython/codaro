import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert(1)</script>');
    expect(result).not.toContain("<script>");
    expect(result).toContain("<p>Hello</p>");
  });

  it("strips onerror attributes", () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
  });

  it("preserves safe HTML", () => {
    const input = '<h1>Title</h1><p>Text with <strong>bold</strong></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain("<h1>Title</h1>");
    expect(result).toContain("<strong>bold</strong>");
  });

  it("adds rel and target to links", () => {
    const result = sanitizeHtml('<a href="https://example.com">Link</a>');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('target="_blank"');
  });

  it("strips data attributes", () => {
    const result = sanitizeHtml('<div data-custom="val">Content</div>');
    expect(result).not.toContain("data-custom");
    expect(result).toContain("Content");
  });

  it("strips javascript: URLs", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("handles empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("preserves code blocks", () => {
    const result = sanitizeHtml("<pre><code>print('hello')</code></pre>");
    expect(result).toContain("<pre>");
    expect(result).toContain("<code>");
  });

  it("preserves table elements", () => {
    const input = "<table><thead><tr><th>Col</th></tr></thead><tbody><tr><td>Val</td></tr></tbody></table>";
    const result = sanitizeHtml(input);
    expect(result).toContain("<table>");
    expect(result).toContain("<th>Col</th>");
    expect(result).toContain("<td>Val</td>");
  });
});
