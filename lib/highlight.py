# coding: utf-8

"""
    mistune_contrib.highlight
    ~~~~~~~~~~~~~~~~~~~~~~~~~

    Support highlight code features for mistune.

    :copyright: (c) 2014 - 2015 by Hsiaoming Yang.
"""

# TODO Make pygments use <code> tags for proper semantic markup.

from pathlib import Path

import mistune
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters.html import HtmlFormatter


def block_code(text, lang, inlinestyles=False, linenos=False):
    if not lang:
        text = text.strip()
        return u'<pre><code>%s</code></pre>\n' % mistune.escape(text)

    try:
        lexer = get_lexer_by_name(lang, stripall=True)
        formatter = HtmlFormatter(
            noclasses=inlinestyles, linenos=linenos
        )
        code = highlight(text, lexer, formatter)
        if linenos:
            return '<div class="highlight-wrapper">%s</div>\n' % code
        return code
    except:
        return '<pre class="%s"><code>%s</code></pre>\n' % (
            lang, mistune.escape(text)
        )


class HighlightRenderer(mistune.Renderer):
    def __init__(self, css_style=False, *args, **kwargs):
        p = Path(css_style)
        if not p.is_file():
            with open(p, 'w') as f:
                f.write(HtmlFormatter().get_style_defs('.highlight'))

        super().__init__(*args, **kwargs)

    def block_code(self, text, lang):
        # renderer has an options
        inlinestyles = self.options.get('inlinestyles', False)
        linenos = self.options.get('linenos', False)
        return block_code(text, lang, inlinestyles, linenos)
