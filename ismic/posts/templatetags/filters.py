import re

from django import template

register = template.Library()

@register.filter
def remove_img(value):
    clean_data = re.sub("(<img.*?>)|(<a.*?>)", "", value, 0, re.IGNORECASE | re.DOTALL | re.MULTILINE)
    # clean_data = re.sub("(<a.*?>)", "", clean_data, 0, re.IGNORECASE | re.DOTALL | re.MULTILINE)
    return clean_data


@register.filter
def first_p(value):
    for par in value.split('</p>'):
        if len(par) > 100:
            cleaned_data = " ".join(filter(lambda x:x[0]!='&', par.split()))
            return cleaned_data.strip()
    return " ".join(filter(lambda x:x[0]!='&', value.split('</p>')[0].split())).strip()


@register.filter
def reading_time(value):
    output = max(1, value // 150)
    return str(output) + ' min read' if output == 1 else str(output) + ' mins read'


@register.filter
def modulo(num, val):
    return num % val

