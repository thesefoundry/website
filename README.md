website for www.thesefoundry.com

## Editing the site

This is a static site served by GitHub Pages, which builds it with Jekyll.

The shared header and footer live in one place each:

- `_includes/nav.html` — the top navigation bar (and the mobile menu)
- `_includes/footer.html` — the site footer

Every page pulls those in with `{% include nav.html %}` and
`{% include footer.html %}`, so changing a nav link or the footer is a
single-file edit that applies to the whole site. GitHub rebuilds and
redeploys automatically on push to `main`.

Each page begins with an empty Jekyll front-matter block:

```
---
---
```

Leave that in place — it is what tells Jekyll to process the includes.
Without it, the `{% include %}` tags would show up as literal text.

Nav and footer links use root-relative URLs (e.g. `/#services`,
`/resources/`) so the same include works from every page.

`_site/` is the local build output and is not committed.
