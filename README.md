# Assyst - The dev-facilitating bot
Assyst's primary purpose is to provide ease-of-life features to developers.
It has a range of utilitarian commands, ranging from code execution to website screenshotting.

## Features
    - Powerful message edit and delete handling, so command messages can be edited and the command will be re-run.
    - Completely open-source. Anyone can contribute.
    - Simple to self-host, extend, and modify.
    - Powerful flag parsing and documentation of all flags.
    - Written in pure TypeScript, with as little dependency on libraries as possible.

## Commands (As of 19/02/2020)
### **code**
Executes code in a range of languages. The languages can be listed with the `list` subcommand.

### **tag, createtag, edittag, deletetag, tags**
Tag commands. tags are guild-specific text that can be called using an identifying name.
All tags are parsed using an extensive parser, which includes code execution, choice statements, random numbers, and more.

[Full parser documentation](https://github.com/Jacherr/Assyst-TS/PARSER_DOCS.md)

### **ocr**
Optical character recognition. Takes an image input and reads the text from it.

### **shodan**
Queries shodan using a search term and returns relevant IPs.

### **screenshot**
Screenshots a webpage.

### **embed**
Creates an embed using meta tags, based off of input flags.

### **help**
Returns a list of the bot's commands.

### **ping**
Returns the bot's gateway, REST, and database latency.