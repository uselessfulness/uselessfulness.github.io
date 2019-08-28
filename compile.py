"""Renders templates with Jinja and writes to files in /docs."""
from pathlib import Path
from jinja2 import Template, Environment, FileSystemLoader

def compile_index_templates():
    for template_file in templates_dir.iterdir():
        name = template_file.name
        if not 'base' in name:
            template = env.get_template(name)
            try:
                (d, n) = name.split('-')
                with open(output_dir / d / n, 'w') as f:
                    f.write(template.render())
            except ValueError:
                with open(output_dir / name, 'w') as f:
                    f.write(template.render())

if __name__ == '__main__':
    # Load directories to read from/write to.
    templates_dir = Path('templates')
    output_dir = Path('docs')
    # Load templates into Jinja (for template inheritance)
    env = Environment(loader=FileSystemLoader('templates'))
    
    compile_index_templates()
