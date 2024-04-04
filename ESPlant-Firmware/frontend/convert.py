import os

path_to_script = os.path.dirname(os.path.abspath(__file__))

def convert_html_to_c_string(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Escape characters in the HTML content
    html_content = html_content.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n"\n"');
    # while '  ' in html_content:
    #     html_content = html_content.replace('  ', ' ')

    # Create C string
    c_string = 'const char index_html[] = "' + html_content + '";'

    return c_string

def generate_cmakelists_html_include(html_file):
    c_string = convert_html_to_c_string(html_file)

    # Write to index_html.c
    outfile = os.path.join(path_to_script, '../main', 'index_html.c')
    with open(outfile, 'w', encoding='utf-8') as f:
        f.write(c_string)

if __name__ == '__main__':
    html_file = os.path.join(path_to_script, '../main/data', 'index.html')
    generate_cmakelists_html_include(html_file)
    # remove html_file and folder
    os.remove(html_file)
    os.rmdir(os.path.join(path_to_script, '../main/data'))
