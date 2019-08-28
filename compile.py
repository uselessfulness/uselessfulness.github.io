"""Renders templates with Jinja and writes to files in /docs."""
from pathlib import Path
from jinja2 import Template, Environment, FileSystemLoader
from mistune import markdown

def compile_templates(env, templates_dir):
    output_dir = Path('docs')
    for template_file in templates_dir.iterdir():
        name = template_file.name
        if not 'base' in name:
            template = env.get_template(name)
            try:
                (d, n) = name.split('_')
                with open(output_dir / d / n, 'w+') as f:
                    if name == 'blog_index.html':
                        f.write(template.render(posts=metadata))
                    else:
                        f.write(template.render())
            except ValueError:
                with open(output_dir / name, 'w+') as f:
                    f.write(template.render())

def create_blog_templates(templates_dir):
    metadata = []
    posts_dir = Path('posts')
    for post_file in posts_dir.iterdir():
        # Add metadata in filename sans .md extension to list.
        metadata.append(PostMetadata(post_file.name[:-3]))
        with open(post_file, 'r') as fr:
            file = metadata[-1].file
            with open(templates_dir / f'blog_{file}', 'w+') as fw:
                fw.write(
                    f'{{% extends "blogpost-base.html" %}}\n'
                    f'{{% block post %}}\n'
                    f'{markdown(fr.read())}\n'
                    f'{{% endblock %}}'
                )
            # Grabs the post title to use in /blog/index.html
            fr.seek(0)
            metadata[-1].title = fr.readline().rstrip()[2:]
    # Return metadata so it can be used in /blog/index.html
    return metadata

class PostMetadata:
    def __init__(self, filename):
        (self.date, self.file) = filename.split('_')
        self.file += '.html'

if __name__ == '__main__':
    # Load directories to read from/write to.
    templates_dir = Path('templates')
    # Load templates into Jinja (for template inheritance).
    env = Environment(loader=FileSystemLoader('templates'))

    # Create templates for blog posts and get metadata for each.
    metadata = create_blog_templates(templates_dir)
    # Write all templates to /docs
    compile_templates(env, templates_dir)
