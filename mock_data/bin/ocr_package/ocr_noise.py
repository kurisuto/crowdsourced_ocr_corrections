#!/usr/bin/env python3
import random

substitutions = {
    ',' : ['.'],
    '.' : [','],
    '5' : ['S'],
    '8' : ['B'],
    'B' : ['8'],
    'I' : ['1', 'l', 'i', '|'],
    'O' : ['0', 'o', 'U'],
    'S' : ['5'],
    'c' : ['e'],
    'd' : ['cl', 'ol'],
    'e' : ['c'],
    'h' : ['li', 'n'],
    'i' : ['1', 'l', 'I'],
    'l' : ['1', 'I', 'i', '|'],
    'm' : ['mm', 'rn'],
    'n' : ['ii'],
    'o' : ['0', 'O', 'u'],
    'w' : ['vv'],
    }


def add_ocr_noise(input):
    output = ""

    for c in input:

        if c not in substitutions:
            output += c
            continue
        
        value = random.random()
        if value < .95:
            output += c
            continue
       
        new_char = random.choice(substitutions[c])        
        output += new_char
    
    return(output)



