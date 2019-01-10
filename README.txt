# https://uselessful.me : https://youtu.be/-ljaH_AKAtM

## Validation

- /index.html
    WARNING Consider adding a lang attribute the the html tag
            - Added lang="en" to HTML tags for rest of website
    ERROR   img element must have alt attribute except under certain conditions
            - Added relevant alt descriptions of images for rest of document
    ERROR   Element a not allowed as child of element ul
            - Avoided where suitable, as would require a hacky CSS solution to
            perform the same function without using this element order

- /about/index.html
    WARNING type attribute unnecessary for JavaScript resources
            - Removed type="text/javascript" from further scripts
    ERROR   Element a not allowed as child of element ul
            - As previous
    ERROR   End tag for body seen, but unclosed elements
    ERROR   Unclosed element div
            - Removed irrelevant development code

- /about/index.html
    NB that the majority of this page is generated at runtime and changes
    often, so there may be deviations from the W3C standard not shown here

    One such example would have been the lack of alt tags on images, but this
    was corrected regardless.

    ERROR   Element a not allowed as child of element ul
            - As previous

- /demo/index.html
    ERROR   Element a not allowed as child of element ul
            - As previous

- /styles/main.css,landing.css,store.css,about.css
    ERROR   Value errors on CSS variables
            - Ignored, as present in spec
    ERROR   -webkit-flex* unknown vendor extension
            - Ignored, as needed for modern safari versions

## Testing

This site was tested on recent versions of Firefox, Chrome and Safari desktop,
and Firefox and Chrome mobile.

Notable Issues:
    - Webkit extension required with Safari
    - Checkout button in navbar did not scale for mobile, solution was a
        media query reducing the size of the font
